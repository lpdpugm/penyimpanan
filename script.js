const fileArea = document.getElementById("fileArea");
const breadcrumb = document.getElementById("breadcrumb");
const contextMenu = document.getElementById("contextMenu");
const logoutBtn = document.getElementById("logoutBtn");
let currentPath = new URLSearchParams(location.search).get("path") || "";
let adminToken = localStorage.getItem("token");

// tampil awal
loadFolder(currentPath);

if (adminToken) logoutBtn.classList.remove("d-none");
logoutBtn.onclick = () => {
  localStorage.removeItem("token");
  location.reload();
};

async function loadFolder(path) {
  const res = await fetch(`/api/list?path=${encodeURIComponent(path)}`);
  const files = await res.json();

  renderBreadcrumb(path);
  renderFiles(files, path);
}

function renderBreadcrumb(path) {
  const parts = path ? path.split("/") : [];
  let html = `<li class="breadcrumb-item"><a href="#" onclick="openPath('')">Home</a></li>`;
  parts.forEach((p,i)=>{
    const sub = parts.slice(0,i+1).join("/");
    html += `<li class="breadcrumb-item"><a href="#" onclick="openPath('${sub}')">${p}</a></li>`;
  });
  breadcrumb.innerHTML = html;
}

function openPath(p){
  currentPath = p;
  history.pushState({}, "", `?path=${encodeURIComponent(p)}`);
  loadFolder(p);
}

function renderFiles(files, path){
  fileArea.innerHTML = "";
  files.forEach(f=>{
    const card = document.createElement("div");
    card.className="col-auto file-card";
    let thumb = "";
    if (f.type === "dir") thumb = "📁";
    else if (f.name.match(/\.(png|jpg|jpeg|gif)$/i)) thumb = `<img src="${f.download_url}" class="file-thumb">`;
    else if (f.name.match(/\.pdf$/i)) thumb = `<iframe src="https://docs.google.com/gview?embedded=true&url=${f.download_url}" class="file-thumb"></iframe>`;
    else thumb = "📄";

    card.innerHTML = `<div>${thumb}</div><div class="truncate" title="${f.name}">${f.name}</div>`;
    card.onclick = ()=>{ if(f.type==="dir") openPath(path?`${path}/${f.name}`:f.name); };
    fileArea.appendChild(card);
  });
}
