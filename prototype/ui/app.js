const sidebar = document.getElementById('sidebar');
const menuButton = document.getElementById('menuButton');
const densityButton = document.getElementById('densityButton');
const searchInput = document.getElementById('searchInput');
const appShell = document.querySelector('.app-shell');

menuButton?.addEventListener('click', () => {
  const mobile = window.matchMedia('(max-width: 700px)').matches;
  sidebar.classList.toggle(mobile ? 'open' : 'collapsed');
  if (!mobile) appShell.querySelector('.main')?.classList.toggle('sidebar-collapsed');
  menuButton.setAttribute('aria-expanded', String(mobile ? sidebar.classList.contains('open') : !sidebar.classList.contains('collapsed')));
});

densityButton?.addEventListener('click', () => {
  document.body.classList.toggle('compact');
  const compact = document.body.classList.contains('compact');
  densityButton.textContent = `Density: ${compact ? 'Compact' : 'Comfortable'}`;
});

searchInput?.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll('.detainee-panel tbody tr').forEach((row) => {
    row.hidden = query !== '' && !row.textContent.toLowerCase().includes(query);
  });
});

document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((nav) => nav.classList.remove('active'));
    item.classList.add('active');
    if (window.matchMedia('(max-width: 700px)').matches) sidebar.classList.remove('open');
  });
});

document.querySelectorAll('.detainee-panel tbody tr').forEach((row) => {
  [...row.children].forEach((cell, index) => {
    const labels = ['ID', 'Nama', 'Blok', 'Status', 'Update'];
    cell.dataset.label = labels[index] || '';
  });
});
