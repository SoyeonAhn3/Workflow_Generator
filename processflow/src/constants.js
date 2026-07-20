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
  gray500:   "#666666",
  gray300:   "#BFBFBF",
  gray100:   "#F5F7FA",
  white:     "#FFFFFF",
  border:    "#E2E8F0",
  red:       "#E8545F",
  redLight:  "#FEF0F1",
  redBorder: "#F5C6C9",

  // 페이지 배경
  pageBg:    "#F0F4F8",

  // 사이드바
  sidebarBg:       "#FFFFFF",
  sidebarBorder:   "#E2E8F0",
  sidebarText:     "#404040",
  sidebarSubText:  "#888888",
  sidebarActiveBg: "#EBF3FB",
  sidebarHover:    "rgba(46,117,182,0.04)",

  // 카드 그림자
  cardShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  cardShadowHover: "0 4px 12px rgba(0,0,0,0.1)",

  // warning (주의사항)
  warning:       "#b45309",
  warningBg:     "#fffbeb",
  warningBorder: "#fde68a",

  // 추가 색상
  bgVeryLight:   "#F7FAFD",
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
    name: "운영팀",
    icon: "운",
    color: "#1F4E79",
    groups: [
      {
        id: "g1",
        name: "정기 점검 프로세스",
        processes: [
          {
            id: "p1",
            name: "정기 점검 처리 프로세스",
            dept: "운영팀",
            owner: "홍길동",
            module: "OP",
            updatedAt: "2026.03",
            description: "점검 대상 항목을 각 반에 통보하고 병렬로 확인한 뒤 결과를 취합하여 완료 처리하는 예시 프로세스",
            steps: [
              {
                id: "s1",
                title: "점검 항목 통보",
                screenName: "관리 포털",
                dept: "운영팀",
                pt: "30min",
                logic: "관리 포털에서 당월 점검 대상 항목 전체 조회\n항목 목록을 정리하여 담당 반별로 분류\n1반·2반 담당자에게 확인 요청 발송",
                images: [],
                warning: "",
                colIndex: 0,
              },
              {
                id: "s2",
                title: "A 구역 데이터 확인",
                screenName: "점검 시스템",
                dept: "1반",
                pt: "40min",
                logic: "통보받은 항목 중 A 구역 관련 건 확인\n데이터 대조 후 시스템 수정 처리",
                images: [],
                warning: "",
                colIndex: 1,
              },
              {
                id: "s2b",
                title: "B 구역 데이터 확인",
                screenName: "점검 시스템",
                dept: "2반",
                pt: "40min",
                logic: "통보받은 항목 중 B 구역 관련 건 확인\n데이터 대조 후 시스템 수정 처리",
                images: [],
                warning: "",
                colIndex: 1,
              },
              {
                id: "s3",
                title: "확인 결과 취합",
                screenName: "관리 포털",
                dept: "운영팀",
                pt: "20min",
                logic: "1반·2반 수정 완료 후 결과 재조회\n미완료 여부 확인 및 잔여 항목 목록화",
                images: [],
                warning: "양 반 확인 완료 후 진행",
                colIndex: 2,
              },
              {
                id: "s3b",
                title: "점검 완료 처리",
                screenName: "관리 포털",
                dept: "운영팀",
                pt: "15min",
                logic: "전체 항목 확인 완료 후 완료 처리 실행\n완료 현황 보고",
                images: [],
                warning: "기한 내 미완료 시 담당자에게 통보",
                colIndex: 3,
              },
            ],
          },
          {
            id: "p2",
            name: "재고 조정 프로세스",
            dept: "운영팀",
            owner: "김철수",
            module: "OP",
            updatedAt: "2026.03",
            description: "재고 현황을 조회하고 조정 요청을 등록하여 결과를 검토하는 예시 프로세스",
            steps: [
              {
                id: "s4",
                title: "재고 현황 조회",
                screenName: "재고 시스템",
                dept: "운영팀",
                pt: "30min",
                logic: "재고 시스템에서 당월 현황 전체 조회\n항목별 수량 확인 및 이상 여부 검토",
                images: [],
                warning: "",
              },
              {
                id: "s5",
                title: "조정 요청 등록",
                screenName: "재고 시스템",
                dept: "운영팀",
                pt: "20min",
                logic: "조정이 필요한 항목 일괄 등록\n요청 유형 및 일자 확인 후 저장",
                images: [],
                warning: "등록 완료 메시지 확인",
              },
              {
                id: "s6",
                title: "조정 결과 검토",
                screenName: "재고 시스템",
                dept: "운영팀",
                pt: "20min",
                logic: "등록 후 수량 재확인\n조정 전후 합계 일치 여부 검토",
                images: [],
                warning: "",
              },
            ],
          },
          {
            id: "p3",
            name: "월간 리포트 작성",
            dept: "운영팀",
            owner: "이영희",
            module: "OP",
            updatedAt: "2026.03",
            description: "월간 데이터를 집계하고 검토·확정하는 예시 프로세스",
            steps: [
              {
                id: "s7",
                title: "데이터 집계",
                screenName: "리포트 도구",
                dept: "운영팀",
                pt: "40min",
                logic: "리포트 도구에서 월간 데이터 집계 실행\n전체 항목 대상으로 산출 후 결과 확인",
                images: [],
                warning: "",
              },
              {
                id: "s8",
                title: "리포트 검토 및 확정",
                screenName: "리포트 도구",
                dept: "운영팀",
                pt: "30min",
                logic: "집계 결과 검토\n이상값 수정 후 최종 확정",
                images: [],
                warning: "",
              },
            ],
          },
        ],
      },
      {
        id: "g2",
        name: "요청 관리 프로세스",
        processes: [
          {
            id: "p4",
            name: "요청 처리 현황 분석",
            dept: "운영팀",
            owner: "박민수",
            module: "OP",
            updatedAt: "2026.03",
            description: "요청 처리 데이터를 추출하고 분석 보고서를 작성하는 예시 프로세스",
            steps: [
              {
                id: "s9",
                title: "요청 데이터 추출",
                screenName: "관리 포털",
                dept: "운영팀",
                pt: "30min",
                logic: "관리 포털에서 당월 요청/처리 데이터 추출\n유형별, 담당별 필터 적용 후 다운로드",
                images: [],
                warning: "",
              },
              {
                id: "s10",
                title: "분석 보고서 작성",
                screenName: "리포트 도구",
                dept: "운영팀",
                pt: "60min",
                logic: "추출 데이터 기반 처리 현황 분석표 작성\n주요 항목 코멘트 추가 후 보고",
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
    name: "지원팀",
    icon: "지",
    color: "#2E75B6",
    groups: [
      {
        id: "g3",
        name: "정기 보고 프로세스",
        processes: [
          {
            id: "p5",
            name: "월간 보고 취합",
            dept: "지원팀",
            owner: "최지원",
            module: "SP",
            updatedAt: "2026.03",
            description: "각 부서 자료를 취합하고 교차 확인하여 최종 확정하는 예시 프로세스",
            steps: [
              {
                id: "s11",
                title: "부서 자료 입력 확인",
                screenName: "보고 포털",
                dept: "지원팀",
                pt: "60min",
                logic: "보고 포털에서 각 부서 제출 자료 확인\n미제출 부서 목록화 후 재요청",
                images: [],
                warning: "제출 기한: 매월 말일 17:00",
              },
              {
                id: "s12",
                title: "자료 일괄 취합",
                screenName: "보고 포털",
                dept: "지원팀",
                pt: "30min",
                logic: "제출 자료 일괄 취합 실행\n대상 기간, 유형 확인 후 실행",
                images: [],
                warning: "",
              },
              {
                id: "s13",
                title: "내용 교차 확인",
                screenName: "보고 포털",
                dept: "지원팀",
                pt: "40min",
                logic: "취합된 자료 전체 조회\n원본과 합계 대조 확인",
                images: [],
                warning: "불일치 시 재요청",
              },
              {
                id: "s14",
                title: "최종 확정 및 보고",
                screenName: "보고 포털",
                dept: "지원팀",
                pt: "10min",
                logic: "최종 확정 처리 실행\n대상 기간 마감 후 완료 보고",
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
