package co.uk.shardsinc.signalwatch;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.TypedValue;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Foreground-only, consent-based, network-free BLE broadcast observation.
 * RSSI and advertisement presence NEVER establish that an intrusion occurred.
 */
public final class MainActivity extends Activity {
    private static final int REQUEST_BLUETOOTH = 19;
    private static final int MAX_IDENTIFIERS = 120;
    private final byte[] sessionSalt = new byte[16];
    private final Map<String, Observation> observations = new HashMap<>();
    private final Handler handler = new Handler(Looper.getMainLooper());
    private BluetoothLeScanner scanner;
    private TextView status;
    private TextView dashboard;
    private Button startButton;
    private Button stopButton;
    private boolean observing = false;
    private long startedAt = 0;

    private static final class Observation {
        String id;
        int rssi;
        int observations;
        int manufacturerFields;
        long lastSeen;
        Observation(String id, int rssi, int manufacturerFields, long now) {
            this.id=id; this.rssi=rssi; this.manufacturerFields=manufacturerFields;
            this.observations=1; this.lastSeen=now;
        }
    }

    private final Runnable refresh = new Runnable() {
        @Override public void run() {
            render();
            if(observing) handler.postDelayed(this, 1000);
        }
    };

    private final ScanCallback callback = new ScanCallback() {
        @Override public void onScanResult(int callbackType, ScanResult result) {
            runOnUiThread(() -> addObservation(result));
        }
        @Override public void onBatchScanResults(java.util.List<ScanResult> results) {
            runOnUiThread(() -> { for (ScanResult r : results) addObservation(r); });
        }
        @Override public void onScanFailed(int errorCode) {
            runOnUiThread(() -> { stopObservation(); status.setText("BLE scanning failed, Android error " + errorCode); });
        }
    };

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        new SecureRandom().nextBytes(sessionSalt);
        buildInterface();
        status.setText("OFFLINE / IDLE • No scan has started.");
        render();
    }

    private int dp(float v) {
        return (int)TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics());
    }

    private TextView text(String value, int size, int colour) {
        TextView v=new TextView(this);
        v.setText(value);v.setTextSize(size);v.setTextColor(colour);
        v.setPadding(dp(2),dp(7),dp(2),dp(7));return v;
    }

    private void buildInterface() {
        int back=Color.rgb(7,13,24), teal=Color.rgb(124,238,216), white=Color.rgb(227,245,251), muted=Color.rgb(160,183,201);
        ScrollView sc=new ScrollView(this);sc.setFillViewport(true);sc.setBackgroundColor(back);
        LinearLayout layout=new LinearLayout(this);layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(dp(21),dp(29),dp(21),dp(26));
        sc.addView(layout,new ScrollView.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.WRAP_CONTENT));
        layout.addView(text("◇ SHARDS / SIGNAL WATCH",14,teal));
        TextView heading=text("OFFLINE BLE\nOBSERVATION",29,white);
        heading.setLetterSpacing(-0.04f);layout.addView(heading);
        layout.addView(text("Native BLE advertisement discovery. Only your phone can see local broadcasts. No internet permission, cloud account or external scanner.",13,muted));
        status=text("",13,teal);layout.addView(status);
        LinearLayout controls=new LinearLayout(this);controls.setOrientation(LinearLayout.HORIZONTAL);
        startButton=new Button(this);startButton.setText("START LOCAL SCAN");
        stopButton=new Button(this);stopButton.setText("STOP");
        startButton.setOnClickListener(v->requestStart());
        stopButton.setOnClickListener(v->stopObservation());
        controls.addView(startButton,new LinearLayout.LayoutParams(0,dp(62),2f));
        controls.addView(stopButton,new LinearLayout.LayoutParams(0,dp(62),1f));
        layout.addView(controls);stopButton.setEnabled(false);
        layout.addView(text("NEARBY SIGNAL OBSERVATIONS",11,teal));
        dashboard=text("",13,white);dashboard.setTextIsSelectable(true);dashboard.setMinHeight(dp(300));
        layout.addView(dashboard,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.WRAP_CONTENT));
        layout.addView(text("Interpretation boundary: a nearby advertisement or strong RSSI is not evidence of hacking. This app neither jams radios nor interferes with devices. Android may throttle scanning; observations stop when the app leaves the foreground. No identifiers are saved.",11,muted));
        setContentView(sc);
    }

    private String[] requiredPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return new String[]{Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_CONNECT};
        }
        return new String[]{Manifest.permission.ACCESS_FINE_LOCATION};
    }

    private void requestStart() {
        ArrayList<String> missing=new ArrayList<>();
        for(String p:requiredPermissions()) if(checkSelfPermission(p)!=PackageManager.PERMISSION_GRANTED) missing.add(p);
        if(!missing.isEmpty()) {
            requestPermissions(missing.toArray(new String[0]),REQUEST_BLUETOOTH);
            return;
        }
        startObservation();
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grants) {
        super.onRequestPermissionsResult(requestCode,permissions,grants);
        if(requestCode!=REQUEST_BLUETOOTH)return;
        for(int grant:grants) if(grant!=PackageManager.PERMISSION_GRANTED) {
            status.setText("Scan unavailable: Bluetooth permission was not granted.");
            return;
        }
        requestStart();
    }

    @SuppressLint("MissingPermission")
    private void startObservation() {
        if(observing)return;
        try {
            BluetoothManager manager=(BluetoothManager)getSystemService(Context.BLUETOOTH_SERVICE);
            BluetoothAdapter adapter=manager==null?null:manager.getAdapter();
            if(adapter==null){status.setText("This Android device has no Bluetooth adapter.");return;}
            if(!adapter.isEnabled()){status.setText("Enable Bluetooth in system settings, then retry.");return;}
            scanner=adapter.getBluetoothLeScanner();
            if(scanner==null){status.setText("BLE scanner unavailable on this device.");return;}
            observations.clear();
            ScanSettings settings=new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_BALANCED).build();
            scanner.startScan(null,settings,callback);
            observing=true;startedAt=System.currentTimeMillis();
            startButton.setEnabled(false);stopButton.setEnabled(true);
            status.setText("● OBSERVING / OFFLINE / FOREGROUND ONLY");
            handler.removeCallbacks(refresh);handler.post(refresh);
        } catch (SecurityException ex) {
            status.setText("Android denied the Bluetooth scan permission.");
        } catch (RuntimeException ex) {
            status.setText("BLE scan unavailable: "+ex.getClass().getSimpleName());
        }
    }

    @SuppressLint("MissingPermission")
    private void stopObservation() {
        observing=false;
        handler.removeCallbacks(refresh);
        if(scanner!=null){try{scanner.stopScan(callback);}catch(SecurityException ignored){}}
        scanner=null;
        if(startButton!=null)startButton.setEnabled(true);
        if(stopButton!=null)stopButton.setEnabled(false);
        if(status!=null)status.setText("OFFLINE / STOPPED • Observations remain in RAM only.");
        render();
    }

    private String ephemeralId(String address) {
        try {
            MessageDigest digest=MessageDigest.getInstance("SHA-256");
            digest.update(sessionSalt);byte[] out=digest.digest(address.getBytes(StandardCharsets.UTF_8));
            StringBuilder b=new StringBuilder();for(int i=0;i<6;i++)b.append(String.format(Locale.ROOT,"%02x",out[i]));
            return b.toString();
        } catch (Exception ignored) {return "unavailable";}
    }

    @SuppressLint("MissingPermission")
    private void addObservation(ScanResult result) {
        if(!observing||result==null||result.getDevice()==null)return;
        try {
            String id=ephemeralId(result.getDevice().getAddress());
            long now=System.currentTimeMillis();int rssi=result.getRssi();
            int fields=result.getScanRecord()==null||result.getScanRecord().getManufacturerSpecificData()==null?
                    0:result.getScanRecord().getManufacturerSpecificData().size();
            Observation observation=observations.get(id);
            if(observation==null) {
                if(observations.size()>=MAX_IDENTIFIERS)return;
                observations.put(id,new Observation(id,rssi,fields,now));
            } else {
                observation.rssi=rssi;observation.observations++;
                observation.lastSeen=now;observation.manufacturerFields=fields;
            }
        }catch(SecurityException ignored){status.setText("Permission denied while reading BLE metadata.");}
    }

    private void render(){
        if(dashboard==null)return;
        ArrayList<Observation> all=new ArrayList<>(observations.values());
        Collections.sort(all,Comparator.comparingInt(o -> -o.rssi));
        StringBuilder out=new StringBuilder();
        out.append("Distinct session pseudonyms: ").append(all.size()).append("\n");
        if(observing)out.append("Observation age: ").append((System.currentTimeMillis()-startedAt)/1000).append("s\n");
        out.append("No raw MAC address, name or payload is persisted.\n\n");
        if(all.isEmpty())out.append("No BLE advertisements observed yet. Android may restrict scanning.\n");
        int max=Math.min(all.size(),24);
        for(int i=0;i<max;i++){
            Observation v=all.get(i);
            String proximity=v.rssi>=-50?"STRONG":v.rssi>=-75?"MEDIUM":"WEAK";
            out.append("◇ ").append(v.id).append("  ").append(v.rssi).append(" dBm · ").append(proximity)
               .append("\n    sightings ").append(v.observations).append(" · manufacturer fields ")
               .append(v.manufacturerFields).append("\n");
        }
        if(all.size()>max)out.append("\n+").append(all.size()-max).append(" additional pseudonyms not displayed.\n");
        dashboard.setText(out.toString());
    }

    @Override protected void onPause(){stopObservation();super.onPause();}
    @Override protected void onDestroy(){stopObservation();super.onDestroy();}
}
