import { ImageResponse } from 'next/og';
export const runtime='edge';
export const alt='Shards Inc — Intelligence, governed.';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){
  return new ImageResponse(<div style={{display:'flex',width:'100%',height:'100%',background:'#05060a',color:'#f3f4f5',padding:75,flexDirection:'column',justifyContent:'space-between',fontFamily:'sans-serif',position:'relative'}}>
    <div style={{display:'flex',fontSize:24,letterSpacing:3}}>SHARDS / INC.</div>
    <div style={{display:'flex',flexDirection:'column'}}><div style={{display:'flex',fontSize:110,letterSpacing:-6,fontWeight:600}}>Intelligence,</div><div style={{display:'flex',fontSize:110,letterSpacing:-6,fontWeight:600,color:'#d8b46e'}}>governed.</div></div>
    <div style={{display:'flex',fontSize:21,color:'#aeb4bb'}}>Deterministic control planes for autonomous AI.</div>
    <div style={{display:'flex',position:'absolute',top:75,right:75,fontSize:16,color:'#d8b46e'}}>ALPHA / OPEN SOURCE</div>
  </div>,size);
}
