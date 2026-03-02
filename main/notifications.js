const { Notification } = require('electron');
const store = require('./store');

let intervalId = null;
let mainWindow = null;

function start(window) {
  mainWindow = window;
  intervalId = setInterval(checkDeadlines, 60000);
  // Run once immediately
  checkDeadlines();
}

function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function checkDeadlines() {
  const todos = store.getAllTodos();
  const now = new Date();

  todos.forEach(todo => {
    if (todo.status === '已完成') return;
    if (!todo.deadline) return;

    const deadline = new Date(todo.deadline);
    const diffMs = deadline - now;
    const diffMinutes = diffMs / (1000 * 60);
    const lastNotified = todo.notifiedAt ? new Date(todo.notifiedAt) : null;
    const minutesSinceNotified = lastNotified ? (now - lastNotified) / (1000 * 60) : Infinity;

    // DDL reached: notify immediately when deadline passes, then every 30 minutes
    if (diffMs <= 0 && minutesSinceNotified > 30) {
      const overdueHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
      let overdueText;
      if (overdueHours < 1) {
        const overdueMinutes = Math.abs(Math.floor(diffMinutes));
        overdueText = `Overdue by ${overdueMinutes} minute${overdueMinutes !== 1 ? 's' : ''}`;
      } else if (overdueHours < 24) {
        overdueText = `Overdue by ${overdueHours} hour${overdueHours !== 1 ? 's' : ''}`;
      } else {
        const overdueDays = Math.floor(overdueHours / 24);
        overdueText = `Overdue by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}`;
      }
      sendNotification(
        'Deadline Reached!',
        `"${todo.title}" is overdue!\n${overdueText} — still not completed.`,
        todo.id,
        'critical'
      );
      store.updateTodo(todo.id, { notifiedAt: now.toISOString() });
    }
    // Within 30 minutes: notify if not notified in the last 15 minutes
    else if (diffMinutes > 0 && diffMinutes <= 30 && minutesSinceNotified > 15) {
      const minsLeft = Math.round(diffMinutes);
      sendNotification(
        'Due Soon',
        `"${todo.title}" is due in ${minsLeft} minute${minsLeft !== 1 ? 's' : ''}!`,
        todo.id,
        'warning'
      );
      store.updateTodo(todo.id, { notifiedAt: now.toISOString() });
    }
    // Within 1 hour: notify once
    else if (diffMinutes > 30 && diffMinutes <= 60 && minutesSinceNotified > 60) {
      sendNotification(
        'Upcoming Deadline',
        `"${todo.title}" is due in about 1 hour.`,
        todo.id,
        'info'
      );
      store.updateTodo(todo.id, { notifiedAt: now.toISOString() });
    }
  });
}

function sendNotification(title, body, todoId, urgency) {
  if (!Notification.isSupported()) return;

  const notification = new Notification({
    title: title,
    body: body,
    silent: false,
    urgency: urgency === 'critical' ? 'critical' : 'normal',
    timeoutType: urgency === 'critical' ? 'never' : 'default'
  });

  notification.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send('notification:clicked', todoId);
    }
  });

  notification.show();
}

module.exports = { start, stop };
