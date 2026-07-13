// ═══════════════════════════════════════════════════════════
//  LEO DISTRICT 306 D1 — DISTRICT BLOGS PAGE ENGINE
// ═══════════════════════════════════════════════════════════

function renderPublicBlogs() {
  const container = document.getElementById('blogs-container');
  if (!container) return;
  container.innerHTML = '';

  const searchInput = document.getElementById('blog-search');
  const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
  let list = getCollection(STORAGE_KEYS.BLOGS).filter(b => b.status === 'Active');

  // Sort by order ascending
  list.sort((a,b) => a.displayOrder - b.displayOrder);

  if (q) {
    list = list.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.author.toLowerCase().includes(q) || 
      b.content.toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `<div class="no-results glass-panel" style="grid-column: 1/-1; padding: 40px; text-align: center;"><i class="fa-solid fa-face-frown" style="font-size: 2rem; color: var(--color-gold); margin-bottom: 10px; display: block;"></i> No blog posts matched your search.</div>`;
    return;
  }

  list.forEach(blog => {
    const card = document.createElement('article');
    card.className = 'blog-card glass-panel reveal';
    card.style.cssText = `
      display: flex;
      flex-direction: column;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.01);
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    `;

    // Hover styles
    card.onmouseover = () => {
      card.style.transform = 'translateY(-5px)';
      card.style.borderColor = 'rgba(234,170,0,0.3)';
      card.style.background = 'rgba(255,255,255,0.02)';
    };
    card.onmouseout = () => {
      card.style.transform = 'translateY(0)';
      card.style.borderColor = 'rgba(255,255,255,0.06)';
      card.style.background = 'rgba(255,255,255,0.01)';
    };

    const photoStyle = `style="width: 100%; height: 100%; object-fit: cover; transform: scale(${blog.photoScale || 1}); object-position: ${blog.photoX || 50}% ${blog.photoY || 50}%;"`;
    const coverImg = blog.photo 
      ? `<img src="${blog.photo}" ${photoStyle}>`
      : `<div class="profile-icon-fallback" style="width:100%; height:100%; font-size:2.5rem; display:flex; align-items:center; justify-content:center; color:rgba(234,170,0,0.4);"><i class="fa-solid fa-blog"></i></div>`;

    const cleanPreview = blog.content.substring(0, 140) + (blog.content.length > 140 ? '...' : '');

    card.innerHTML = `
      <div class="blog-cover-wrapper" style="width: 100%; height: 200px; overflow: hidden; position: relative; background: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(255,255,255,0.06);">
        ${coverImg}
      </div>
      <div class="blog-info-content" style="padding: 24px; display: flex; flex-direction: column; flex-grow: 1; gap: 12px;">
        <div class="blog-meta-row" style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #9e8070;">
          <span><i class="fa-solid fa-calendar-day" style="margin-right: 5px;"></i> ${blog.date}</span>
          <span><i class="fa-solid fa-user-pen" style="margin-right: 5px;"></i> ${blog.author}</span>
        </div>
        <h3 style="font-family: var(--font-heading); color: #fff; font-size: 1.15rem; line-height: 1.4; margin: 0; font-weight: 600;">${blog.title}</h3>
        <p style="font-size: 0.86rem; color: #bcaaa4; line-height: 1.6; margin: 0; flex-grow: 1;">${cleanPreview}</p>
        <button class="btn-primary" onclick="openBlogDetail('${blog.id}')" style="align-self: flex-start; padding: 8px 16px; font-size: 0.8rem; border-radius: 8px; margin-top: 5px; border:none; cursor:pointer;">Read Article <i class="fa-solid fa-arrow-right" style="margin-left: 5px;"></i></button>
      </div>
    `;
    container.appendChild(card);
  });
  revealElements();
}

function openBlogDetail(blogId) {
  const blogs = getCollection(STORAGE_KEYS.BLOGS);
  const blog = blogs.find(b => b.id === blogId);
  if (!blog) return;

  const modal = document.getElementById('blog-detail-modal');
  const inner = document.getElementById('blog-detail-content');
  if (!modal || !inner) return;

  const photoStyle = `style="width: 100%; height: 100%; object-fit: cover; transform: scale(${blog.photoScale || 1}); object-position: ${blog.photoX || 50}% ${blog.photoY || 50}%;"`;
  const coverImg = blog.photo 
    ? `<div style="width: 100%; height: 320px; overflow: hidden; border-radius: 16px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.08);"><img src="${blog.photo}" ${photoStyle}></div>`
    : '';

  inner.innerHTML = `
    ${coverImg}
    <div style="display: flex; gap: 15px; font-size: 0.82rem; color: #9e8070; margin-bottom: 12px;">
      <span><i class="fa-solid fa-calendar-day"></i> Published on <strong>${blog.date}</strong></span>
      <span>•</span>
      <span><i class="fa-solid fa-user-pen"></i> By <strong>${blog.author}</strong></span>
    </div>
    <h2 class="gradient-text" style="font-family: var(--font-heading); font-size: 1.8rem; margin: 0 0 20px 0; line-height: 1.3;">${blog.title}</h2>
    <div style="font-size: 0.95rem; color: #d7ccc8; line-height: 1.7; white-space: pre-wrap; margin-top: 15px;">${blog.content}</div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeBlogDetailModal() {
  const modal = document.getElementById('blog-detail-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ── INITIALIZATION ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Render immediately from local cache
  renderPublicBlogs();

  // Async sync in background
  syncFromSupabase('blogs').then(updated => {
    if (updated) renderPublicBlogs();
  });

  const searchInput = document.getElementById('blog-search');
  if (searchInput) {
    searchInput.addEventListener('input', renderPublicBlogs);
  }
});
