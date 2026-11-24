const QueueNotifications = (() => {
  const pollIntervalMs = 10000;
  const previousPositions = new Map();
  let appointmentsLoader = null;
  let pollInterval = null;
  let isLoading = false;
  let toastStack = null;

  function getToastStack() {
    if (toastStack) return toastStack;
    toastStack = document.createElement('div');
    toastStack.className = 'queue-notification-stack';
    toastStack.setAttribute('aria-live', 'polite');
    toastStack.setAttribute('aria-relevant', 'additions');
    document.body.appendChild(toastStack);
    return toastStack;
  }

  function showToast(title, message) {
    const toast = document.createElement('div');
    toast.className = 'queue-notification';

    const heading = document.createElement('strong');
    heading.textContent = title;
    const body = document.createElement('span');
    body.textContent = message;
    toast.append(heading, body);
    getToastStack().appendChild(toast);

    window.setTimeout(() => {
      toast.classList.add('queue-notification-leaving');
      window.setTimeout(() => toast.remove(), 250);
    }, 7000);
  }

  function notifyQueueMovement(appointment, oldPosition, newPosition) {
    const language = typeof I18n !== 'undefined' ? I18n.language : 'en';
    const title = language === 'ta'
      ? 'வரிசை முன்னேறியுள்ளது'
      : language === 'hi' ? 'कतार आगे बढ़ी' : 'Queue moved forward';
    const message = language === 'ta'
      ? `டோக்கன் #${appointment.tokenNumber} வரிசையில் #${oldPosition} இலிருந்து #${newPosition} இடத்திற்கு நகர்ந்தது.`
      : language === 'hi'
        ? `टोकन #${appointment.tokenNumber} कतार में #${oldPosition} से #${newPosition} स्थान पर आ गया।`
        : `Token #${appointment.tokenNumber} moved from position #${oldPosition} to #${newPosition}.`;

    showToast(title, message);
    if (!QueueNotifications.desktopSupported || QueueNotifications.desktopPermission !== 'granted') return;

    try {
      const notification = new window.Notification(title, { body: message });
      window.setTimeout(() => notification.close(), 7000);
    } catch (error) {
      console.error('Unable to show desktop queue notification:', error);
    }
  }

  function observe(appointments) {
    const activeIds = new Set();
    appointments.forEach(appointment => {
      if (appointment.status !== 'waiting') return;
      if (appointment.appointmentDate && !isAppointmentToday(appointment.appointmentDate)) return;
      const appointmentId = String(appointment._id || '');
      const position = Number(appointment.queuePosition);
      if (!appointmentId || !Number.isInteger(position) || position < 1) return;

      activeIds.add(appointmentId);
      const previousPosition = previousPositions.get(appointmentId);
      if (previousPosition !== undefined && position < previousPosition) {
        notifyQueueMovement(appointment, previousPosition, position);
      }
      previousPositions.set(appointmentId, position);
    });

    for (const appointmentId of previousPositions.keys()) {
      if (!activeIds.has(appointmentId)) previousPositions.delete(appointmentId);
    }
  }

  async function poll() {
    if (!appointmentsLoader || isLoading) return;
    isLoading = true;
    try {
      const appointments = await appointmentsLoader();
      observe(Array.isArray(appointments) ? appointments : []);
    } catch (error) {
      console.error('Unable to check for queue movement:', error);
    } finally {
      isLoading = false;
    }
  }

  function start(loadAppointments) {
    if (typeof loadAppointments !== 'function') {
      throw new TypeError('Queue notification monitoring requires an appointments loader.');
    }
    stop();
    appointmentsLoader = loadAppointments;
    poll();
    pollInterval = window.setInterval(poll, pollIntervalMs);
  }

  function stop() {
    if (pollInterval !== null) window.clearInterval(pollInterval);
    pollInterval = null;
    appointmentsLoader = null;
    previousPositions.clear();
  }

  return {
    start,
    stop,
    observe,
    get desktopSupported() { return 'Notification' in window; },
    get desktopPermission() {
      return this.desktopSupported ? window.Notification.permission : 'unsupported';
    },
    requestDesktopPermission() {
      if (!this.desktopSupported) return Promise.resolve('unsupported');
      return window.Notification.requestPermission();
    }
  };
})();
