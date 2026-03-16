// ============================================================
// 색상 토큰 — 전체 앱 공통
// ============================================================
export const C = {
  navy:      "#1F4E79",
  blue:      "#2E75B6",
  blueMid:   "#4A90C4",
  blueLight: "#D6E4F0",
  bluePale:  "#EBF3FB",
  gray700:   "#404040",
  gray500:   "#595959",
  gray300:   "#BFBFBF",
  gray100:   "#F2F2F2",
  white:     "#FFFFFF",
  border:    "#E2E8F0",
  red:       "#EF4444",
  redLight:  "#FEF2F2",
  redBorder: "#FECACA",

  // 페이지 배경
  pageBg:    "#F0F4F8",

  // 사이드바 (다크 테마)
  sidebarBg:       "#1A3A5C",
  sidebarBorder:   "#0F2540",
  sidebarText:     "#C5D8EC",
  sidebarSubText:  "#8FB5D4",
  sidebarActiveBg: "rgba(46,117,182,0.35)",
  sidebarHover:    "rgba(255,255,255,0.06)",

  // 카드 그림자
  cardShadow: "0 1px 4px rgba(0,0,0,0.08)",
  cardShadowHover: "0 4px 16px rgba(0,0,0,0.13)",

  // warning (주의사항)
  warning:       "#b45309",
  warningBg:     "#fffbeb",
  warningBorder: "#fde68a",
}

// 부서별 아이콘 배경색 순환 팔레트
export const DEPT_COLORS = [
  "#1F4E79", "#2E75B6", "#059669", "#d97706", "#7c3aed",
]

// Claude 모델명 — 변경 시 이 한 줄만 수정
export const CLAUDE_MODEL = "claude-sonnet-4-20250514"

// ============================================================
// 샘플 초기 데이터
// ============================================================
export const SAMPLE_DATA = [
  {
    id: "d1",
    name: "CO팀",
    icon: "C",
    color: "#1F4E79",
    groups: [
      {
        id: "g1",
        name: "마감 프로세스",
        processes: [
          {
            id: "p1",
            name: "물류마감 Check 프로세스",
            dept: "CO팀",
            owner: "김재무",
            module: "CO",
            updatedAt: "2026.03",
            description: "월 마감 전 물류 미결 항목을 조회하고 담당 부서에 통보하여 처리 완료를 확인하는 프로세스",
            steps: [
              {
                id: "s1",
                title: "물류 미결 현황 조회",
                screenName: "MB52",
                dept: "CO팀",
                pt: "30min",
                logic: "MB52 실행 후 해당 월 기준 미결 항목 전체 조회\n필터: 플랜트 전체, 이동 유형 미선택",
                images: [],
                warning: "",
              },
              {
                id: "s2",
                title: "미결 항목 담당부서 통보",
                screenName: "메일",
                dept: "CO팀",
                pt: "20min",
                logic: "조회된 미결 목록을 Excel로 추출 후 담당 부서별 분류\n부서별 담당자 메일로 처리 요청 발송",
                images: [],
                warning: "",
              },
              {
                id: "s3",
                title: "처리 완료 확인",
                screenName: "MB52",
                dept: "CO팀",
                pt: "20min",
                logic: "통보 후 익일 MB52 재조회하여 미결 해소 여부 확인\n잔여 미결 항목 목록화 및 현황 보고",
                images: [],
                warning: "기한 내 미완료 시 escalation",
              },
            ],
          },
          {
            id: "p2",
            name: "가공비 마감",
            dept: "CO팀",
            owner: "이원가",
            module: "CO",
            updatedAt: "2026.03",
            description: "월 마감 시 가공비 현황을 조회하고 전표를 생성하여 결과를 검증하는 프로세스",
            steps: [
              {
                id: "s4",
                title: "가공비 현황 조회",
                screenName: "KSB5",
                dept: "CO팀",
                pt: "30min",
                logic: "KSB5 실행 후 해당 월 가공비 현황 전체 조회\n원가 센터별 금액 확인 및 이상 여부 검토",
                images: [],
                warning: "",
              },
              {
                id: "s5",
                title: "전표 생성",
                screenName: "KB21N",
                dept: "CO팀",
                pt: "20min",
                logic: "KB21N에서 가공비 전표 일괄 생성\n문서 유형 및 전기 일자 확인 후 저장",
                images: [],
                warning: "생성 완료 메시지 확인",
              },
              {
                id: "s6",
                title: "생성 결과 검증",
                screenName: "KSB5",
                dept: "CO팀",
                pt: "20min",
                logic: "KSB5에서 전표 생성 후 금액 재확인\n전표 전후 합계 일치 여부 검토",
                images: [],
                warning: "",
              },
            ],
          },
          {
            id: "p3",
            name: "재료비 마감",
            dept: "CO팀",
            owner: "박원가",
            module: "CO",
            updatedAt: "2026.03",
            description: "표준원가를 산출하고 검토·확정하는 마감 프로세스",
            steps: [
              {
                id: "s7",
                title: "표준원가 산출",
                screenName: "CK11N",
                dept: "CO팀",
                pt: "40min",
                logic: "CK11N에서 자재별 표준원가 계산 실행\n전체 자재 대상으로 원가 산출 후 결과 확인",
                images: [],
                warning: "",
              },
              {
                id: "s8",
                title: "원가 검토 및 확정",
                screenName: "CKR1",
                dept: "CO팀",
                pt: "30min",
                logic: "CKR1에서 산출된 표준원가 검토\n이상값 수정 후 원가 확정 처리",
                images: [],
                warning: "",
              },
            ],
          },
        ],
      },
      {
        id: "g2",
        name: "예산 관리 프로세스",
        processes: [
          {
            id: "p4",
            name: "예산 실적 대비 분석",
            dept: "CO팀",
            owner: "최예산",
            module: "CO",
            updatedAt: "2026.03",
            description: "예산 대비 실적 데이터를 추출하고 분석 보고서를 작성하는 프로세스",
            steps: [
              {
                id: "s9",
                title: "예산 실적 데이터 추출",
                screenName: "GR55",
                dept: "CO팀",
                pt: "30min",
                logic: "GR55에서 당월 예산/실적 데이터 추출\n원가 센터별, 계정별 필터 적용 후 Excel 다운로드",
                images: [],
                warning: "",
              },
              {
                id: "s10",
                title: "분석 보고서 작성",
                screenName: "Excel",
                dept: "CO팀",
                pt: "60min",
                logic: "추출 데이터 기반 예실 대비 분석표 작성\n주요 차이 항목 코멘트 추가 후 보고",
                images: [],
                warning: "",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "d2",
    name: "재무팀",
    icon: "F",
    color: "#2E75B6",
    groups: [
      {
        id: "g3",
        name: "월 마감 프로세스",
        processes: [
          {
            id: "p5",
            name: "월 마감 전표 생성",
            dept: "재무팀",
            owner: "정마감",
            module: "FI",
            updatedAt: "2026.03",
            description: "월말 마감을 위한 전표 일괄 생성 및 최종 확정 프로세스",
            steps: [
              {
                id: "s11",
                title: "부서 데이터 입력 확인",
                screenName: "FB50",
                dept: "재무팀",
                pt: "60min",
                logic: "FB50에서 각 부서 입력 전표 확인\n미입력 부서 목록화 후 재요청",
                images: [],
                warning: "마감: 매월 말일 17:00",
              },
              {
                id: "s12",
                title: "전표 일괄 생성",
                screenName: "F.01",
                dept: "재무팀",
                pt: "30min",
                logic: "F.01 배치 프로그램으로 전표 일괄 생성\n전기 일자, 문서 유형 확인 후 실행",
                images: [],
                warning: "",
              },
              {
                id: "s13",
                title: "데이터 대조 확인",
                screenName: "FBL3N",
                dept: "재무팀",
                pt: "40min",
                logic: "FBL3N에서 생성된 전표 전체 조회\n원장 잔액과 보조원장 합계 대조 확인",
                images: [],
                warning: "불일치 시 전표 재생성",
              },
              {
                id: "s14",
                title: "월마감 최종 확정",
                screenName: "F.16",
                dept: "재무팀",
                pt: "10min",
                logic: "F.16 월마감 프로그램 실행\n마감 기간 Lock 처리 후 완료 보고",
                images: [],
                warning: "",
              },
            ],
          },
        ],
      },
    ],
  },
]
