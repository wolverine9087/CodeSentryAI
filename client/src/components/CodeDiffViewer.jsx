import {useState} from 'react';
import './CodeDiffViewer.css';

export default function CodeDiffViewer({files,issues=[]}){
  const [active,setActive]=useState(0),[view,setView]=useState('original');
  if(!files.length)return null;
  const current=files[Math.min(active,files.length-1)];
  const displaySource=view==='corrected'&&current.fixedSource?current.fixedSource:current.source;
  const flagged=new Map();
  for(const issue of issues){
    if(issue.file===current.name&&Number.isInteger(Number(issue.line))&&Number(issue.line)>0){
      const lines=flagged.get(Number(issue.line))||[];
      lines.push(issue);
      flagged.set(Number(issue.line),lines);
    }
  }
  function downloadCorrected(){const blob=new Blob([current.fixedSource],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`${current.name.replace(/(\.[^.]+)?$/,'-corrected$1')}`;link.click();URL.revokeObjectURL(url)}
  return <section className="panel code-diff"><div className="panel-head"><div><h2>Code diff</h2><p className="sub">Review the original and corrected source, then download the corrected file.</p></div>{current.fixedSource&&<button className="btn" onClick={downloadCorrected}>Download corrected</button>}</div>{files.length>1&&<div className="code-tabs">{files.map((file,index)=><button className={`code-tab ${index===active?'active':''}`} key={`${file.name}-${index}`} onClick={()=>{setActive(index);setView(file.fixedSource?'corrected':'original')}}>{file.name}</button>)}</div>}<div className="code-tabs"><button className={`code-tab ${view==='original'?'active':''}`} onClick={()=>setView('original')}>Original</button><button className={`code-tab ${view==='corrected'?'active':''}`} disabled={!current.fixedSource} onClick={()=>current.fixedSource&&setView('corrected')}>Corrected</button>{!current.fixedSource&&<span className="sub">AI corrections require a configured Groq API key.</span>}</div><div className="code-viewer">{displaySource.split('\n').map((line,index)=>{const number=index+1;const findings=view==='original'?(flagged.get(number)||[]):[];return <div className={`code-line ${findings.length?'has-finding':''}`} key={number}><span className="code-line-number">{number}</span><code>{line||' '}</code>{findings.length>0&&<span className="code-line-note">{findings.map(issue=>issue.title).join('; ')}</span>}</div>})}</div></section>
}
