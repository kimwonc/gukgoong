let stream = null;
let facing = "environment";

async function startCamera() {
  const video = document.getElementById('video');
  // 1. 기존 트랙 정리 (다른 앱 점유 해결)
  if(stream) stream.getTracks().forEach(t => t.stop());

  // 2. HTTPS 체크 - 안드로이드 필수
  if(!window.isSecureContext){
    alert("안드로이드는 https에서만 카메라가 됩니다.\n지금은 " + location.protocol + " 입니다.\nGitHub Pages나 Netlify에 올려서 https로 열어주세요.");
    return;
  }

  const constraintsList = [
    {video: {facingMode: {exact: facing}, width:{ideal:1920}, height:{ideal:1080}}, audio:false},
    {video: {facingMode: facing, width:{ideal:1280}, height:{ideal:720}}, audio:false},
    {video: {facingMode: facing}, audio:false},
    {video: true, audio:false} // 최후의 수단
  ];

  let lastErr = null;
  for(let cons of constraintsList){
    try{
      stream = await navigator.mediaDevices.getUserMedia(cons);
      break; // 성공하면 탈출
    }catch(e){
      lastErr = e;
      console.log("카메라 시도 실패:", e.name);
      if(e.name === "NotAllowedError") break; // 권한 거부는 더 시도해도 소용없음
      continue; // Overconstrained 등은 다음 단계로 폴백
    }
  }

  if(!stream){
    // 에러별 한글 해결책
    if(lastErr?.name === "NotAllowedError"){
      alert("권한 거부됨!\n해결: 크롬 주소창 왼쪽 자물쇠 아이콘 → 권한 → 카메라 허용 → 새로고침");
    }else if(lastErr?.name === "NotFoundError"){
      alert("카메라를 찾을 수 없습니다.\n카톡, 줌, 카메라 앱이 켜져있으면 모두 종료하고 다시 시도");
    }else if(lastErr?.name === "NotReadableError"){
      alert("카메라가 다른 앱에서 사용 중입니다.\n모든 앱 종료 후 폰 재부팅 후 크롬에서만 열어주세요");
    }else{
      alert("카메라 오류: " + lastErr?.name + "\n크롬을 최신버전으로 업데이트하고 일반 모드(시크릿모드X)에서 열어주세요");
    }
    return;
  }

  video.srcObject = stream;
  video.setAttribute("playsinline", true); // iOS, 안드로이드 필수
  video.setAttribute("muted", true);
  await video.play();
  
  document.getElementById('startScreen').style.display = 'none';
}