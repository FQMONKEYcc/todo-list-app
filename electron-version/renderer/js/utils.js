// ===== Utility Functions =====

function generateId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

function getDeadlineStatus(deadline) {
  if (!deadline) return 'none';
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) return 'overdue';
  if (diffHours <= 24) return 'imminent';
  if (diffHours <= 72) return 'approaching';
  return 'normal';
}

function formatDeadline(deadline) {
  if (!deadline) return '';
  const dl = new Date(deadline);
  const now = new Date();
  const diffMs = dl - now;

  // Show relative time for nearby deadlines
  if (diffMs < 0) {
    const hours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
    if (hours < 24) return `Overdue ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Overdue ${days}d`;
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  if (days <= 7) return `${days}d left`;

  // Show date for farther deadlines
  const month = dl.getMonth() + 1;
  const day = dl.getDate();
  const hour = dl.getHours().toString().padStart(2, '0');
  const min = dl.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hour}:${min}`;
}

function toLocalDatetime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function fromLocalDatetime(localString) {
  if (!localString) return null;
  return new Date(localString).toISOString();
}

const STATUS_ORDER = { '未开始': 0, '进行中': 1, '已完成': 2 };

function nextStatus(status) {
  if (status === '未开始') return '进行中';
  if (status === '进行中') return '已完成';
  return '未开始';
}
