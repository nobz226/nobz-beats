import React from "react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xpqganbw";

const SOCIAL_LINKS = [
  {
    name: "SoundCloud",
    url: "https://soundcloud.com/user-621182531",
    icon: "logo-soundcloud",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@nobz_beats7894/featured",
    icon: "logo-youtube",
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Connect() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState("idle"); // idle | sending | success | error
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = "Name is required";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!EMAIL_RE.test(formData.email.trim()))
      next.email = "Enter a valid email";
    if (!formData.message.trim()) next.message = "Message is required";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setErrors({});
      } else {
        const data = await res.json().catch(() => null);
        const message =
          data?.errors?.map((er) => er.message).join(", ") ||
          "Something went wrong. Please try again.";
        setErrorMessage(message);
        setStatus("error");
        // fields intentionally retained so the person can fix and resubmit
      }
    } catch (err) {
      console.error("[Connect] submit failed", err);
      setErrorMessage("Network error. Check your connection and try again.");
      setStatus("error");
      // fields intentionally retained so the person can fix and resubmit
    }
  };

  const isSending = status === "sending";
  const inputClass = (hasError) =>
    `w-full bg-white/5 border rounded px-3 py-2 text-white focus:outline-none focus:border-white/30 disabled:opacity-50 ${hasError ? "border-red-500/60" : "border-white/10"}`;

  return (
    <section
      className={`latest-section fixed z-[1000] text-white opacity-0 translate-y-2 animate-section-fade ${isMobile ? "left-0 right-0 w-full flex flex-col overflow-hidden" : "p-0 custom-scrollbar"}`}
      style={{
        left: isMobile ? "0" : "var(--main-left)",
        top: isMobile ? "var(--main-top)" : "calc(var(--main-top) - 1rem)",
        bottom: isMobile ? "var(--player-bottom)" : "auto",
        width: isMobile ? "100%" : "auto",
        maxWidth: isMobile
          ? "none"
          : "var(--latest-maxwidth, calc(100% - (var(--logo-size) + var(--logo-gap) + 2rem)))",
        animationDelay:
          "calc(var(--logo-fade) + var(--title-fade) + var(--title-gap) + 0.72s)",
      }}
      aria-label='Connect'
    >
      <h2
        className={`font-cal-sans font-bold text-[1.75rem] m-0 mb-2 ${isMobile ? "px-4" : ""}`}
      >
        Connect
      </h2>

      <div
        className={`font-cutive font-normal flex-1 overflow-x-hidden custom-scrollbar ${isMobile ? "overflow-y-auto px-4 pb-24" : ""}`}
      >
        <div
          className={`flex items-center gap-3 mb-6 ${isMobile ? "px-4" : ""}`}
        >
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target='_blank'
              rel='noopener noreferrer'
              aria-label={`${link.name} (opens in a new tab)`}
              title={link.name}
              className='flex items-center justify-center w-11 h-11 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-colors'
            >
              <ion-icon
                name={link.icon}
                className='text-2xl text-white'
                aria-hidden='true'
              ></ion-icon>
            </a>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className={`max-w-md flex flex-col gap-4 ${isMobile ? "px-4" : ""}`}
          aria-busy={isSending}
        >
          <label className='block'>
            <span className='block text-sm font-medium mb-1 opacity-80'>
              Name
            </span>
            <input
              name='name'
              type='text'
              value={formData.name}
              onChange={handleChange}
              disabled={isSending}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "connect-name-error" : undefined}
              className={inputClass(!!errors.name)}
            />
            {errors.name && (
              <span
                id='connect-name-error'
                className='block mt-1 text-xs text-red-400'
              >
                {errors.name}
              </span>
            )}
          </label>

          <label className='block'>
            <span className='block text-sm font-medium mb-1 opacity-80'>
              Email
            </span>
            <input
              name='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
              disabled={isSending}
              aria-invalid={!!errors.email}
              aria-describedby={
                errors.email ? "connect-email-error" : undefined
              }
              className={inputClass(!!errors.email)}
            />
            {errors.email && (
              <span
                id='connect-email-error'
                className='block mt-1 text-xs text-red-400'
              >
                {errors.email}
              </span>
            )}
          </label>

          <label className='block'>
            <span className='block text-sm font-medium mb-1 opacity-80'>
              Message
            </span>
            <textarea
              name='message'
              rows={4}
              value={formData.message}
              onChange={handleChange}
              disabled={isSending}
              aria-invalid={!!errors.message}
              aria-describedby={
                errors.message ? "connect-message-error" : undefined
              }
              className={`${inputClass(!!errors.message)} min-h-[100px] resize-none`}
            />
            {errors.message && (
              <span
                id='connect-message-error'
                className='block mt-1 text-xs text-red-400'
              >
                {errors.message}
              </span>
            )}
          </label>

          <button
            type='submit'
            disabled={isSending}
            className={`px-4 py-2 bg-white/10 text-white rounded font-medium hover:bg-white/20 transition-colors w-full sm:w-auto sm:self-start ${isSending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSending ? "Sending…" : "Send Message"}
          </button>

          <div role='status' aria-live='polite'>
            {status === "success" && (
              <p className='text-sm text-green-400'>
                Thanks — your message was sent. I'll get back to you soon.
              </p>
            )}
            {status === "error" && (
              <p className='text-sm text-red-400'>{errorMessage}</p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
