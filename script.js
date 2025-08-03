const socket = io("http://183.102.182.111:3000/");

let nickname = prompt("닉네임을 입력하세요") || "익명";
socket.emit("set-nickname", nickname);

// 내 커서 움직임 전송
document.addEventListener("mousemove", (e) => {
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;
  socket.emit("cursor-move", { x, y });
});

const cursors = {}; // id: {el, x, y, tx, ty}

// 커서 추가
function addCursor(id, name) {
  const el = document.createElement("div");
  el.className = "cursor";
  el.setAttribute("data-name", name); // 이름 표시용 속성
  document.body.appendChild(el);

  cursors[id] = { el, x: 0, y: 0, tx: 0, ty: 0 };
}

// 커서 제거
function removeCursor(id) {
  const c = cursors[id];
  if (c) {
    c.el.remove();
    delete cursors[id];
  }
}

// 커서 위치 업데이트
socket.on("cursor-update", (data) => {
  if (!cursors[data.id]) return;

  cursors[data.id].tx = data.x * window.innerWidth;
  cursors[data.id].ty = data.y * window.innerHeight;
});

// 새 유저 접속
socket.on("user-joined", ({ id, name }) => {
  addCursor(id, name);
});

// 유저 퇴장
socket.on("user-left", (id) => {
  removeCursor(id);
});

// 부드러운 움직임
function animate() {
  for (const id in cursors) {
    const c = cursors[id];
    c.x += (c.tx - c.x) * 0.1;
    c.y += (c.ty - c.y) * 0.1;

    c.el.style.left = c.x + "px";
    c.el.style.top = c.y + "px";
  }
  requestAnimationFrame(animate);
}
animate();