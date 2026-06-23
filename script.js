const welcomeScreen = document.getElementById("welcomeScreen");
const invitation = document.getElementById("invitation");
const openInvitation = document.getElementById("openInvitation");
const closeInvitation = document.getElementById("closeInvitation");
const welcomeInvitee = document.getElementById("welcomeInvitee");
const cardInvitee = document.getElementById("cardInvitee");
const eventName = document.getElementById("eventName");
const eventDate = document.getElementById("eventDate");
const eventTime = document.getElementById("eventTime");
const eventVenue = document.getElementById("eventVenue");
const eventMessage = document.getElementById("eventMessage");
const acceptInvitation = document.getElementById("acceptInvitation");
const declineInvitation = document.getElementById("declineInvitation");

const defaultSettings = {
  defaultInvitee: "Guest",
  eventName: "17th Installation - OASIS Toastmasters",
  eventDate: "Sunday, 9 August 2026",
  eventTime: "9:00 AM onwards",
  venueName: "Hotel Chance Palace, Kottala, Veyangoda",
  venueUrl: "https://www.google.com/maps/dir//Hotel+Chance+Palace,+Mallehewa+Road,+Kottala,+Veyangoda+11100/@7.1265399,80.1093562,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3ae2e2b8cd5af693:0x8a8b38f9c364f54a!2m2!1d80.0771449!2d7.1732257?ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D",
  message: "We would be privileged to have you with us as we celebrate this memorable occasion.",
  rsvpEmail: "sachithra29@gmail.com",
};

let inviteeName = defaultSettings.defaultInvitee;
let activeSettings = defaultSettings;

function parseProperties(text) {
  return text.split("\n").reduce((settings, line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return settings;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      return settings;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();
    settings[key] = value;

    return settings;
  }, {});
}

async function loadSettings() {
  try {
    const response = await fetch("invitation.properties");

    if (!response.ok) {
      return defaultSettings;
    }

    const properties = parseProperties(await response.text());
    return { ...defaultSettings, ...properties };
  } catch {
    return defaultSettings;
  }
}

function formatInviteeName(value) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getInviteeFromUrl() {
  const queryName = new URLSearchParams(window.location.search).get("name");

  if (queryName) {
    return formatInviteeName(decodeURIComponent(queryName));
  }

  const hashParts = window.location.hash.replace(/^#\/?/, "").split("/");
  const hashName = hashParts[0] === "invitation" ? hashParts[1] : hashParts[0];

  if (hashName && hashName !== "invitation") {
    return formatInviteeName(decodeURIComponent(hashName));
  }

  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const folderIndex = pathParts.indexOf("invitation-card");
  const pathName = folderIndex >= 0 ? pathParts[folderIndex + 1] : "";

  if (pathName && pathName !== "index.html") {
    return formatInviteeName(decodeURIComponent(pathName));
  }

  return "";
}

function getInvitationHash() {
  const encodedName = encodeURIComponent(inviteeName.replace(/\s+/g, "-"));
  return `#invitation/${encodedName}`;
}

function applySettings(settings) {
  activeSettings = settings;
  inviteeName = getInviteeFromUrl() || settings.defaultInvitee;

  welcomeInvitee.textContent = inviteeName;
  cardInvitee.textContent = inviteeName;
  eventName.textContent = settings.eventName;
  eventDate.textContent = settings.eventDate;
  eventTime.textContent = settings.eventTime;
  eventVenue.textContent = settings.venueName;
  eventVenue.href = settings.venueUrl;
  eventMessage.textContent = settings.message;
}

function sendRsvpEmail(response) {
  const subject = `RSVP ${response}: ${activeSettings.eventName}`;
  const body = [
    `Invitee: ${inviteeName}`,
    `Response: ${response}`,
    `Event: ${activeSettings.eventName}`,
    `Date: ${activeSettings.eventDate}`,
    `Time: ${activeSettings.eventTime}`,
    `Venue: ${activeSettings.venueName}`,
    "",
    "This RSVP was sent from the invitation card.",
  ].join("\n");

  const mailtoUrl = `mailto:${activeSettings.rsvpEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}

function showInvitation() {
  welcomeScreen.classList.add("is-hidden");
  invitation.classList.add("is-open");
}

function hideInvitation() {
  invitation.classList.remove("is-open");
  welcomeScreen.classList.remove("is-hidden");
  history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}

openInvitation.addEventListener("click", (event) => {
  event.preventDefault();
  openInvitation.classList.add("is-opening");

  window.setTimeout(() => {
    showInvitation();
    history.replaceState(null, "", getInvitationHash());
    openInvitation.classList.remove("is-opening");
  }, 520);
});

closeInvitation.addEventListener("click", hideInvitation);
acceptInvitation.addEventListener("click", () => sendRsvpEmail("Accepted"));
declineInvitation.addEventListener("click", () => sendRsvpEmail("Declined"));

loadSettings().then((settings) => {
  applySettings(settings);

  if (window.location.hash.startsWith("#invitation")) {
    showInvitation();
  }
});
