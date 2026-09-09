'use client';
import {Component,type ReactNode} from 'react';
export default class WorldBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true}}
 render(){return this.state.failed?<div className="world-unavailable"><span>3D WORLD</span><h2>WebGL ไม่พร้อมใช้งาน</h2><p>เปิดการเร่งกราฟิกในเบราว์เซอร์เพื่อสำรวจโลก 3D<br/>ยังเลือกธนาคารและอ่านหลักฐานจากเมนูได้</p></div>:this.props.children}
}
