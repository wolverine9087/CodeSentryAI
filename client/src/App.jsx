import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ProjectReview from './pages/ProjectReview.jsx'
import ReviewHistory from './pages/ReviewHistory.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import './App.css'
function Shell(){const {user,loading}=useAuth();const [route,setRoute]=useState(location.pathname);useEffect(()=>{const f=()=>setRoute(location.pathname);addEventListener('popstate',f);return()=>removeEventListener('popstate',f)},[]);const navigate=p=>{history.pushState({},'',p);setRoute(p);window.scrollTo(0,0)};if(loading)return <div className="screen-center">Loading CodeReview…</div>;if(route==='/login')return <Login navigate={navigate}/>;if(route==='/register')return <Register navigate={navigate}/>;if(!user)return <Login navigate={navigate}/>;return <><Navbar navigate={navigate}/><main className="app-main">{route.startsWith('/review/')?<ProjectReview projectId={route.split('/')[2]} navigate={navigate}/>:route==='/history'?<ReviewHistory navigate={navigate}/>:<Dashboard navigate={navigate}/>}</main></>}
export default function App(){return <AuthProvider><Shell/></AuthProvider>}
