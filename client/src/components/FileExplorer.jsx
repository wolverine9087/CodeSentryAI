export default function FileExplorer({files,onSelect}){return <div>{files.map(f=><button className="nav-link" key={f.name} onClick={()=>onSelect?.(f)}>{f.name}</button>)}</div>}
