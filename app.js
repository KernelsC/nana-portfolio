const home = document.querySelector('#home');
const detail = document.querySelector('#project');
const grid = document.querySelector('#grid');
const graphicGrid = document.querySelector('#graphic-grid');
const count = document.querySelector('#result-count');
const asset = id => 'assets/' + id + '.webp';
const number = n => String(n).padStart(2, '0');

const graphicProjects = projects.filter(project => project.category === '平面设计');
const interiorProjects = projects.filter(project => project.category !== '平面设计');

const filters = document.querySelector('#filters');
let selected = categories[0];
for (const category of categories) {
  const button = document.createElement('button');
  button.textContent = category;
  button.addEventListener('click', () => {
    selected = category;
    renderGrid();
  });
  filters.append(button);
}
function renderGrid() {
  const visible = interiorProjects.filter(project => selected === categories[0] || project.category === selected);
  for (const button of filters.children) {
    button.setAttribute('aria-pressed', String(button.textContent === selected));
  }
  count.textContent = visible.length + ' 个项目';
  grid.innerHTML = renderCards(visible);
}
function renderCards(items) {
  return items.map(project => {
    const [id, caption] = project.gallery[0];
    return `<a class="card" href="#project/${project.id}" data-id="${project.id}"><span class="card-photo"><img src="${asset(id)}" alt="${caption}" loading="lazy"></span><span class="card-text"><span><span class="card-meta">${number(projects.indexOf(project)+1)} / ${project.type}</span><h3>${project.title}</h3></span><span class="card-arrow" aria-hidden="true">↗</span></span></a>`;
  }).join('');
}
renderGrid();
graphicGrid.innerHTML = renderCards(graphicProjects);

let activeProject;
function renderRoute() {
  const hash = location.hash;
  const project = projects.find(item => hash === '#project/' + item.id);
  const previous = activeProject;
  activeProject = project;
  if (viewer.open) viewer.close();
  home.hidden = Boolean(project);
  detail.hidden = !project;
  document.title = project ? project.title + ' · 屈梦娜' : '屈梦娜 · 室内与平面设计';
  if (!project) {
    const target = ['#works','#interior','#graphic','#practice','#about','#top','#main'].includes(hash) && document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView();
    else if (previous || !hash) window.scrollTo({top:0,behavior:'instant'});
    return;
  }
  const index = projects.indexOf(project);
  const isGraphic = project.category === '平面设计';
  const direction = isGraphic ? graphicProjects : interiorProjects;
  const directionId = isGraphic ? 'graphic' : 'interior';
  const directionName = isGraphic ? '平面设计' : '室内设计';
  const next = direction[(direction.indexOf(project) + 1) % direction.length];
  detail.innerHTML = `<a class="back" href="#${directionId}">← 返回${directionName}</a><div class="project-intro"><div><p class="eyebrow section-index">${number(index+1)} / ${project.en}</p><h1 tabindex="-1">${project.title}</h1><p class="subtle">${project.type}</p></div><div><p>${project.summary}</p>${project.note ? '<p class="note">'+project.note+'</p>' : ''}</div></div><div class="gallery">${project.gallery.map(([id,caption],i) => `<figure><button data-photo="${i}" aria-label="放大查看${caption}"><img src="${asset(id)}" alt="${caption}" loading="${i === 0 ? 'eager' : 'lazy'}"></button><figcaption><span>${number(i+1)}</span>${caption}</figcaption></figure>`).join('')}</div><div class="next-project"><a href="#works">← 两个设计方向</a><a href="#project/${next.id}">下一项目 · ${next.title} →</a></div>`;
  window.scrollTo({top:0,behavior:'instant'});
  detail.querySelector('h1').focus({preventScroll:true});
}

const viewer = document.querySelector('#viewer');
const image = document.querySelector('#full-image');
const caption = document.querySelector('#viewer-caption');
const previousButton = document.querySelector('#prev');
const nextButton = document.querySelector('#next');
const zoom = document.querySelector('#zoom');
const imageFrame = image.parentElement;
let photoIndex = 0;
function setZoom(expanded) {
  imageFrame.classList.toggle('zoomed', expanded);
  zoom.setAttribute('aria-pressed', String(expanded));
  zoom.textContent = expanded ? '适应窗口' : '放大';
  imageFrame.scrollTo(0, 0);
}
function showPhoto(index) {
  if (!activeProject?.gallery[index]) return;
  photoIndex = index;
  const [id, label] = activeProject.gallery[index];
  image.src = asset(id);
  image.alt = label;
  caption.textContent = number(index+1) + ' / ' + number(activeProject.gallery.length) + ' · ' + label;
  previousButton.disabled = index === 0;
  nextButton.disabled = index === activeProject.gallery.length - 1;
  setZoom(false);
}
detail.addEventListener('click', event => {
  const photo = event.target.closest('[data-photo]');
  if (!photo) return;
  showPhoto(Number(photo.dataset.photo));
  viewer.showModal();
});
document.querySelector('#close').addEventListener('click', () => viewer.close());
previousButton.addEventListener('click', () => showPhoto(photoIndex - 1));
nextButton.addEventListener('click', () => showPhoto(photoIndex + 1));
zoom.addEventListener('click', () => setZoom(zoom.getAttribute('aria-pressed') === 'false'));
viewer.addEventListener('click', event => {
  if (event.target === viewer) viewer.close();
});
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showPhoto(photoIndex + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
window.addEventListener('hashchange', renderRoute);
renderRoute();
