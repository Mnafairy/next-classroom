(() => {
  if (window.__kodlabExamGuard) return;
  window.__kodlabExamGuard = true;
  async function check() {
    if (location.pathname === '/exam' || location.pathname.startsWith('/exam/')) return;
    if (!localStorage.getItem('kodlab-exam-active')) return;
    try {
      const response = await fetch('/api/exam', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (data.attempt?.status === 'active') location.replace('/exam');
      else localStorage.removeItem('kodlab-exam-active');
    } catch { /* A navigation still meets the server-side exam guard. */ }
  }
  window.addEventListener('storage', check);
  window.addEventListener('pageshow', check);
  window.addEventListener('focus', check);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) void check(); });
  void check();
})();
