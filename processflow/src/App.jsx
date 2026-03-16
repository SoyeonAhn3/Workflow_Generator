import { useState } from 'react'
import { loadFromStorage, saveToStorage } from './storage.js'
import { SAMPLE_DATA, C } from './constants.js'
import { deleteImages } from './imageDB.js'
import TopNav from './components/layout/TopNav.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import LV1View from './components/views/LV1View.jsx'
import LV2View from './components/views/LV2View.jsx'
import LV3View from './components/views/LV3View.jsx'
import AddModal from './components/modals/AddModal.jsx'
import StepModal from './components/modals/StepModal.jsx'
import DeleteConfirmModal from './components/modals/DeleteConfirmModal.jsx'
import ExportModal from './components/modals/ExportModal.jsx'
import AddMethodModal from './components/modals/AddMethodModal.jsx'
import AIGenerateModal from './components/modals/AIGenerateModal.jsx'
import EditProcModal from './components/modals/EditProcModal.jsx'
import EditGroupModal from './components/modals/EditGroupModal.jsx'

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

  // ── 팝업 상태 ────────────────────────────────────────────
  const [addModal,    setAddModal]    = useState(null)   // 'dept' | 'group' | 'proc' | null
  const [stepModal,   setStepModal]   = useState(null)   // { mode: 'add'|'edit', step? } | null
  const [deleteModal, setDeleteModal] = useState(null)   // { type, target, childInfo } | null
  const [exportGroup, setExportGroup] = useState(null)
  const [methodModal, setMethodModal] = useState(false)
  const [aiModal,     setAiModal]     = useState(false)
  const [editProcModal,  setEditProcModal]  = useState(null) // proc object
  const [editGroupModal, setEditGroupModal] = useState(null) // group object

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

  // ══════════════════════════════════════════════════════════
  // ── 추가 핸들러 ──────────────────────────────────────────
  // ══════════════════════════════════════════════════════════

  const handleAddSave = (formData) => {
    if (addModal === 'dept') {
      const newDept = {
        id: 'dept_' + Date.now(),
        name: formData.name,
        icon: formData.name[0],
        color: null,
        groups: [],
      }
      updateData((prev) => [...prev, newDept])
    } else if (addModal === 'group') {
      if (!selDept) return
      const newGroup = {
        id: 'grp_' + Date.now(),
        name: formData.name,
        dept: formData.dept || '',
        module: formData.module || '',
        description: formData.description || '',
        processes: [],
      }
      updateData((prev) =>
        prev.map((d) =>
          d.id !== selDept.id ? d : { ...d, groups: [...d.groups, newGroup] }
        )
      )
      // selDept 갱신
      setSelDept((prev) => prev ? { ...prev, groups: [...prev.groups, newGroup] } : prev)
    } else if (addModal === 'proc') {
      if (!selGroup) return
      const now = new Date()
      const newProc = {
        id: 'proc_' + Date.now(),
        name: formData.name,
        dept: formData.dept || '',
        owner: formData.owner || '',
        module: formData.module || '',
        description: formData.description || '',
        updatedAt: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`,
        steps: [],
      }
      updateData((prev) =>
        prev.map((d) => ({
          ...d,
          groups: d.groups.map((g) =>
            g.id !== selGroup.id ? g : { ...g, processes: [...g.processes, newProc] }
          ),
        }))
      )
      // selGroup 갱신
      setSelGroup((prev) => prev ? { ...prev, processes: [...prev.processes, newProc] } : prev)
    }
    setAddModal(null)
  }

  // ══════════════════════════════════════════════════════════
  // ── 단계 추가/수정 핸들러 ────────────────────────────────
  // ══════════════════════════════════════════════════════════

  const handleStepSave = (stepData) => {
    if (!selProc) return
    if (stepModal.mode === 'add') {
      const nextSteps = [...(selProc.steps || []), stepData]
      updateProc(selProc.id, (p) => ({ ...p, steps: nextSteps }))
      setSelProc((prev) => prev ? { ...prev, steps: nextSteps } : prev)
      setSelGroup((prev) => prev ? {
        ...prev,
        processes: prev.processes.map((p) => p.id !== selProc.id ? p : { ...p, steps: nextSteps }),
      } : prev)
    } else {
      const nextSteps = (selProc.steps || []).map((s) => (s.id !== stepData.id ? s : stepData))
      updateProc(selProc.id, (p) => ({ ...p, steps: nextSteps }))
      setSelProc((prev) => prev ? { ...prev, steps: nextSteps } : prev)
      setSelGroup((prev) => prev ? {
        ...prev,
        processes: prev.processes.map((p) => p.id !== selProc.id ? p : { ...p, steps: nextSteps }),
      } : prev)
    }
    setStepModal(null)
  }

  // ══════════════════════════════════════════════════════════
  // ── 삭제 핸들러 4종 ──────────────────────────────────────
  // ══════════════════════════════════════════════════════════

  // 삭제 요청 (모달 열기)
  const requestDeleteDept = (dept) => {
    const gCount = dept.groups.length
    const pCount = dept.groups.reduce((s, g) => s + g.processes.length, 0)
    setDeleteModal({
      type: '부서', target: dept,
      childInfo: gCount > 0 ? `하위 그룹 ${gCount}개, 프로세스 ${pCount}개가 모두 삭제됩니다.` : null,
    })
  }

  const requestDeleteGroup = (group) => {
    const pCount = group.processes.length
    setDeleteModal({
      type: '그룹', target: group,
      childInfo: pCount > 0 ? `하위 프로세스 ${pCount}개가 모두 삭제됩니다.` : null,
    })
  }

  const requestDeleteProc = (proc) => {
    const sCount = (proc.steps || []).length
    setDeleteModal({
      type: '프로세스', target: proc,
      childInfo: sCount > 0 ? `하위 단계 ${sCount}개가 모두 삭제됩니다.` : null,
    })
  }

  // 삭제 실행
  const handleDeleteConfirm = async () => {
    if (!deleteModal) return
    const { type, target } = deleteModal

    if (type === '부서') {
      // 1. 하위 전체 이미지 id 수집
      const imageIds = target.groups
        .flatMap((g) => g.processes)
        .flatMap((p) => p.steps || [])
        .flatMap((s) => s.images || [])
        .map((img) => img.id)
      // 2. IndexedDB 먼저 삭제
      await deleteImages(imageIds)
      // 3. LocalStorage 저장
      updateData((prev) => prev.filter((d) => d.id !== target.id))
      // 4. 선택 상태 초기화
      setSelDept(null)
      setSelGroup(null)
      setSelProc(null)
    } else if (type === '그룹') {
      const imageIds = target.processes
        .flatMap((p) => p.steps || [])
        .flatMap((s) => s.images || [])
        .map((img) => img.id)
      await deleteImages(imageIds)
      updateData((prev) =>
        prev.map((d) => ({ ...d, groups: d.groups.filter((g) => g.id !== target.id) }))
      )
      // selDept 갱신
      setSelDept((prev) =>
        prev ? { ...prev, groups: prev.groups.filter((g) => g.id !== target.id) } : prev
      )
      setSelGroup(null)
      setSelProc(null)
    } else if (type === '프로세스') {
      const imageIds = (target.steps || [])
        .flatMap((s) => s.images || [])
        .map((img) => img.id)
      await deleteImages(imageIds)
      updateData((prev) =>
        prev.map((d) => ({
          ...d,
          groups: d.groups.map((g) => ({
            ...g,
            processes: g.processes.filter((p) => p.id !== target.id),
          })),
        }))
      )
      // selGroup 갱신
      setSelGroup((prev) =>
        prev ? { ...prev, processes: prev.processes.filter((p) => p.id !== target.id) } : prev
      )
      setSelProc(null)
    }
    setDeleteModal(null)
  }

  // 단계 삭제 (window.confirm — 모달 없음)
  const handleDeleteStep = async (step) => {
    if (!selProc) return
    const imageIds = (step.images || []).map((img) => img.id)
    await deleteImages(imageIds)
    const nextSteps = (selProc.steps || []).filter((s) => s.id !== step.id)
    updateProc(selProc.id, (p) => ({ ...p, steps: nextSteps }))
    setSelProc((prev) => prev ? { ...prev, steps: nextSteps } : prev)
    setSelGroup((prev) => prev ? {
      ...prev,
      processes: prev.processes.map((p) => p.id !== selProc.id ? p : { ...p, steps: nextSteps }),
    } : prev)
  }

  // ══════════════════════════════════════════════════════════
  // ── AI 자동 생성 완료 핸들러 ───────────────────────────────
  // ══════════════════════════════════════════════════════════

  const handleAIComplete = (newProc) => {
    if (!selGroup) return
    updateData((prev) =>
      prev.map((d) => ({
        ...d,
        groups: d.groups.map((g) =>
          g.id !== selGroup.id ? g : { ...g, processes: [...g.processes, newProc] }
        ),
      }))
    )
    // selGroup 갱신
    setSelGroup((prev) => prev ? { ...prev, processes: [...prev.processes, newProc] } : prev)
    // AI 모달 닫고 LV3로 이동
    setAiModal(false)
    setSelProc(newProc)
  }

  // ── 프로세스 수정 핸들러 ──────────────────────────────────
  const handleEditProcSave = (updated) => {
    updateProc(updated.id, () => updated)
    // selProc: LV3에서 편집했을 때만 업데이트 (LV2에서 호출 시 LV3로 이동 방지)
    setSelProc((prev) => prev?.id === updated.id ? updated : prev)
    // selGroup 내 proc 업데이트
    setSelGroup((prev) => prev ? {
      ...prev,
      processes: prev.processes.map((p) => p.id !== updated.id ? p : updated),
    } : prev)
    // selDept 내 proc 업데이트 (LV1→LV2 재진입 시 최신 데이터 반영)
    setSelDept((prev) => prev ? {
      ...prev,
      groups: prev.groups.map((g) => ({
        ...g,
        processes: g.processes.map((p) => p.id !== updated.id ? p : updated),
      })),
    } : prev)
    setEditProcModal(null)
  }

  // ── 그룹 수정 핸들러 ──────────────────────────────────────
  const handleEditGroupSave = (updated, newDeptId) => {
    if (newDeptId) {
      // 다른 부서로 이동 — 현재 화면 유지 (selGroup/selProc 건드리지 않음)
      updateData((prev) =>
        prev.map((d) => {
          if (d.groups.some((g) => g.id === updated.id)) {
            return { ...d, groups: d.groups.filter((g) => g.id !== updated.id) }
          }
          if (d.id === newDeptId) {
            return { ...d, groups: [...d.groups, updated] }
          }
          return d
        })
      )
      // selDept에서 해당 그룹 제거 (현재 LV1 화면 갱신)
      setSelDept((prev) => prev ? {
        ...prev,
        groups: prev.groups.filter((g) => g.id !== updated.id),
      } : prev)
    } else {
      // 같은 부서 내 수정
      updateData((prev) =>
        prev.map((d) => ({
          ...d,
          groups: d.groups.map((g) => g.id !== updated.id ? g : updated),
        }))
      )
      // selDept 업데이트 (LV1 카드 즉시 반영)
      setSelDept((prev) => prev ? {
        ...prev,
        groups: prev.groups.map((g) => g.id !== updated.id ? g : updated),
      } : prev)
      // selGroup: 현재 해당 그룹을 보고 있을 때만 업데이트 (LV2 이동 방지)
      setSelGroup((prev) => prev?.id === updated.id ? updated : prev)
    }
    setEditGroupModal(null)
  }

  // ══════════════════════════════════════════════════════════
  // ── 렌더링 ──────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════

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
        background: C.pageBg,
        transition: 'margin-left 0.25s ease',
      }}>
        {view === 'lv1' && (
          <LV1View
            dept={selDept}
            onSelectGroup={handleLV1SelectGroup}
            onAddGroup={() => setAddModal('group')}
            onDeleteDept={requestDeleteDept}
            onDeleteGroup={requestDeleteGroup}
            onEditGroup={(group) => setEditGroupModal(group)}
          />
        )}
        {view === 'lv2' && (
          <LV2View
            dept={selDept}
            group={selGroup}
            onSelectProc={handleLV2SelectProc}
            onAddProc={() => setMethodModal(true)}
            onDeleteGroup={requestDeleteGroup}
            onDeleteProc={requestDeleteProc}
            onEditProc={(proc) => setEditProcModal(proc)}
            onExportWord={() => setExportGroup(selGroup)}
            onBack={() => { setSelGroup(null); setSelProc(null) }}
          />
        )}
        {view === 'lv3' && (
          <LV3View
            dept={selDept}
            group={selGroup}
            proc={selProc}
            onDeleteProc={requestDeleteProc}
            onEditProc={(proc) => setEditProcModal(proc)}
            onAddStep={() => setStepModal({ mode: 'add' })}
            onEditStep={(step) => setStepModal({ mode: 'edit', step })}
            onDeleteStep={handleDeleteStep}
            onBack={() => setSelProc(null)}
          />
        )}
      </div>

      {/* ── 모달 ────────────────────────────────────────────── */}
      {addModal && (
        <AddModal
          level={addModal}
          onSave={handleAddSave}
          onClose={() => setAddModal(null)}
        />
      )}

      {stepModal && (
        <StepModal
          mode={stepModal.mode}
          step={stepModal.step}
          onSave={handleStepSave}
          onClose={() => setStepModal(null)}
        />
      )}

      {deleteModal && (
        <DeleteConfirmModal
          targetName={deleteModal.target.name}
          targetType={deleteModal.type}
          childInfo={deleteModal.childInfo}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteModal(null)}
        />
      )}

      {exportGroup && (
        <ExportModal
          group={exportGroup}
          deptName={selDept?.name || ''}
          onClose={() => setExportGroup(null)}
        />
      )}

      {methodModal && (
        <AddMethodModal
          onSelectDirect={() => {
            setMethodModal(false)
            setAddModal('proc')
          }}
          onSelectAI={() => {
            setMethodModal(false)
            setAiModal(true)
          }}
          onClose={() => setMethodModal(false)}
        />
      )}

      {aiModal && (
        <AIGenerateModal
          deptName={selDept?.name || ''}
          onComplete={handleAIComplete}
          onClose={() => setAiModal(false)}
        />
      )}

      {editProcModal && (
        <EditProcModal
          proc={editProcModal}
          onSave={handleEditProcSave}
          onClose={() => setEditProcModal(null)}
        />
      )}

      {editGroupModal && (
        <EditGroupModal
          group={editGroupModal}
          allDepts={data}
          onSave={handleEditGroupSave}
          onClose={() => setEditGroupModal(null)}
        />
      )}
    </div>
  )
}
