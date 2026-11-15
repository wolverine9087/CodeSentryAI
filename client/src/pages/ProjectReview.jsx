import {useEffect,useState} from 'react';
import {reviewService} from '../services/review.service.js';
import CodeEditor from '../components/CodeEditor.jsx';
import FileUploader from '../components/FileUploader.jsx';
import ReviewPanel from '../components/ReviewPanel.jsx';
import ReviewSummary from '../components/ReviewSummary.jsx';
import CodeDiffViewer from '../components/CodeDiffViewer.jsx';

export default function ProjectReview({projectId,navigate}){
  const [project,setProject]=useState(null),[source,setSource]=useState(''),[filename,setFilename]=useState('snippet.js'),[files,setFiles]=useState([]),[codeFiles,setCodeFiles]=useState([]),[reviews,setReviews]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{reviewService.getProject(projectId).then(d=>{setProject(d.project);if(d.latestReview)setReviews([d.latestReview])}).catch(e=>setError(e.message))},[projectId]);
  async function chooseFiles(selected){
    setError('');
    setReviews([]);
    const codeFiles=selected.filter(file=>/\.(js|jsx|ts|tsx|py|java|go|rb|php|cs|cpp|c|h|html|css|json|md|txt|sql|sh)$/i.test(file.name));
    if(codeFiles.length>4){setFiles([]);setCodeFiles([]);setError('Choose a folder with no more than 4 supported source files.');return}
    if(!codeFiles.length){setFiles([]);setCodeFiles([]);setError('The selected folder has no supported source files.');return}
    setFiles(codeFiles);setCodeFiles(await Promise.all(codeFiles.map(async file=>({name:file.name,source:await file.text()}))));setSource('');
  }
  async function run(){
    setError('');
    if(!files.length&&!source.trim()){setError('Paste code or choose a folder or source files before starting the review.');return}
    setBusy(true);
    try{
      let payload={source,filename};
      if(files.length){payload=new FormData();files.forEach(file=>payload.append('files',file))}
      const result=await reviewService.run(projectId,payload);
      setReviews(result.reviews||[result.review]);
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }
  function editSource(value){setSource(value);setReviews([]);if(value){setFiles([]);setCodeFiles([])}}
  const overallReview=reviews.length?{
    score:Math.round(reviews.reduce((sum,review)=>sum+(Number(review.score)||0),0)/reviews.length),
    issues:reviews.flatMap(review=>(review.issues||[]).map(issue=>({...issue,file:issue.file&&issue.file!=='source'?issue.file:review.filename}))),
    durationMs:reviews.reduce((sum,review)=>sum+(Number(review.durationMs)||0),0),
    summary:reviews.length===1?reviews[0].summary:`Reviewed ${reviews.length} files. Scores are averaged across the selected files.`
  }:null;
  const visibleCodeFiles=codeFiles.length?codeFiles.map((file,index)=>({...file,fixedSource:reviews[index]?.fixedSource||''})):(source.trim()?[{name:filename,source,fixedSource:reviews[0]?.fixedSource||''}]:[]);
  return <><div className="page-head"><div><div className="eyebrow">PROJECT REVIEW</div><h1>{project?.name||'Loading project…'}</h1><p className="sub">Paste a snippet or upload a folder with up to 4 source files.</p></div><button className="btn" onClick={()=>navigate('/')}>← Projects</button></div>{error&&<div className="toast" style={{background:'#351f26',color:'var(--red)'}}>{error}</div>}{overallReview&&<ReviewSummary review={overallReview}/>}<div className="review-layout"><section className="panel"><div className="panel-head"><h2>Source code</h2><span className="sub mono">{files.length?`${files.length} files selected`:filename}</span></div><FileUploader onFiles={chooseFiles} files={files}/><CodeEditor value={source} onChange={editSource}/><div className="row" style={{justifyContent:'space-between',marginTop:14}}><span className="sub">{files.length?`${files.length} files selected`:`${source.split('\n').length} lines · ${source.length} characters`}</span><button className="btn primary" disabled={busy} onClick={run}>{busy?'Reviewing…':'✦ Run AI review'}</button></div></section><ReviewPanel review={overallReview} loading={busy}/></div><CodeDiffViewer files={visibleCodeFiles} issues={overallReview?.issues||[]}/></>
}
