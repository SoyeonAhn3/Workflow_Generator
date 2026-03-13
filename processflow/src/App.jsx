import { useState } from 'react'
import { loadFromStorage, saveToStorage } from './storage.js'
import { SAMPLE_DATA, C } from './constants.js'
import TopNav from './components/layout/TopNav.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import LV1View from './components/views/LV1View.jsx'
import LV2View from './components/views/LV2View.jsx'
import LV3View from './components/views/LV3View.jsx'

export default function App() {
  // ── 데이터 ──────────────────────────────────────────────
  const [data, setData] = useState(() => loadFromStorage() || SAMPLE_DATA)

  // ── 네비게이션 선택 상태 ──────────────────────────────────
  const [selDept,  setSelDept]  = useState(null)
  const [selGroup, setSelGroup] = useState(null)
  const [selProc,  setSelProc]  = useState(null)

  // ── 사이드바 ──────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expDepts,    setExpDepts]    = useState({})
  const [expGroups,   setExpGroups]   = useState({})

  // ── 팝업 상태 (Phase 3~5에서 구현) ───────────────────────
  const [addModal,    setAddModal]    = useState(null)
  const [stepModal,   setStepModal]   = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [exportGroup, setExportGroup] = useState(null)

  // ── 뷰 결정 (URL 없음 — 선택 상태로만 판단) ──────────────
  const view = selProc ? 'lv3' : selGroup ? 'lv2' : 'lv1'

  // ── 데이터 업데이트 + 자동 저장 ──────────────────────────
  const updateData = (fn) => {
    setData((prev) => {
      const next = typeof fn === 'function' ? fn(prev) : fn
      saveToStorage(next)
      return next
    })
  }

  // ── 프로세스 단위 업데이트 헬퍼 ──────────────────────────
  const updateProc = (procId, fn) =>
    updateData((prev) =>
      prev.map((d) => ({
        ...d,
        groups: d.groups.map((g) => ({
          ...g,
          processes: g.processes.map((p) => (p.id !== procId ? p : fn(p))),
        })),
      }))
    )

  // ── 저장 상태 ──────────────────────────────────────────────
  const storageResult  = saveToStorage(data)
  const storageSizeKB  = storageResult?.sizeKB ?? 0
  const storageOk      = storageResult?.ok !== false

  // ── 사이드바 토글 헬퍼 ────────────────────────────────────
  const handleToggleDept = (deptId) =>
    setExpDepts((prev) => ({ ...prev, [deptId]: !prev[deptId] }))

  const handleToggleGroup = (groupId) =>
    setExpGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }))

  // ── 사이드바 선택 헬퍼 ────────────────────────────────────
  const handleSelectDept = (dept) => {
    setSelDept(dept)
    setSelGroup(null)
    setSelProc(null)
    // expDepts는 handleToggleDept가 단독 관리 — 여기서 수정하면 toggle과 충돌
  }

  const handleSelectGroup = (dept, group) => {
    setSelDept(dept)
    setSelGroup(group)
    setSelProc(null)
    setExpGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))
  }

  const handleSelectProc = (dept, group, proc) => {
    setSelDept(dept)
    setSelGroup(group)
    setSelProc(proc)
  }

  // LV1View에서 그룹 클릭 시
  const handleLV1SelectGroup = (group) => {
    setSelGroup(group)
    setSelProc(null)
    setExpGroups((prev) => ({ ...prev, [group.id]: true }))
  }

  // LV2View에서 프로세스 클릭 시
  const handleLV2SelectProc = (proc) => {
    setSelProc(proc)
  }

  const sidebarWidth = sidebarOpen ? 250 : 48

  return (
    <div style={{ fontFamily: "'Malgun Gothic', '맑은 고딕', 'Noto Sans KR', sans-serif", color: C.gray700 }}>
      {/* TopNav */}
      <TopNav
        storageSizeKB={storageSizeKB}
        storageOk={storageOk}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      {/* Sidebar */}
      <Sidebar
        data={data}
        open={sidebarOpen}
        selDept={selDept}
        selGroup={selGroup}
        expDepts={expDepts}
        onSelectDept={handleSelectDept}
        onSelectGroup={handleSelectGroup}
        onToggleDept={handleToggleDept}
        onAddDept={() => setAddModal('dept')}
      />

      {/* Main Content */}
      <div style={{
        marginTop: 52,
        marginLeft: sidebarWidth,
        padding: '28px 32px',
        minHeight: 'calc(100vh - 52px)',
        background: C.gray100,
        transition: 'margin-left 0.25s ease',
      }}>
        {view === 'lv1' && (
          <LV1View
            dept={selDept}
            onSelectGroup={handleLV1SelectGroup}
          />
        )}
        {view === 'lv2' && (
          <LV2View
            dept={selDept}
            group={selGroup}
            onSelectProc={handleLV2SelectProc}
          />
        )}
        {view === 'lv3' && (
          <LV3View
            dept={selDept}
            group={selGroup}
            proc={selProc}
          />
        )}
      </div>
    </div>
  )
}
