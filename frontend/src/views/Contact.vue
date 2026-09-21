<template>
  <div class="public-page">
    <button class="back-btn" @click="$router.push('/')">
      <i class="bi bi-arrow-left"></i> Back
    </button>

    <div class="hero-block">
      <p class="eyebrow">Contact DotLife</p>
      <h1>Reach out to plan a camp or support a donor drive.</h1>
      <p>
        Whether you want to organise a blood camp, ask about donor registration, or request urgent coordination,
        our team is ready to support your community effort.
      </p>
    </div>

    <div class="contact-grid">
      <div class="contact-card">
        <h3>Email</h3>
        <p>support@dotlife.org</p>
      </div>
      <div class="contact-card">
        <h3>Phone</h3>
        <p>+94 11 234 5678</p>
      </div>
      <div class="contact-card">
        <h3>Location</h3>
        <p>Gandhinagar, GJ, India</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.public-page { max-width: 1100px; margin: 0 auto; padding: 88px 24px 80px; position: relative; }
.back-btn { position: absolute; top: 28px; left: 24px; border: 1px solid #dbe2f1; background: #fff; color: #0f172a; border-radius: 999px; padding: 10px 16px; font-weight: 600; box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06); }
.back-btn:hover { background: #f8faff; }
.hero-block { text-align: center; padding: 48px 20px 24px; }
.eyebrow { text-transform: uppercase; letter-spacing: .14em; font-weight: 700; color: #4f46e5; font-size: .72rem; }
.hero-block h1 { font-size: clamp(2.1rem, 4vw, 4rem); font-weight: 800; margin: 12px 0 16px; color: #0f172a; }
.hero-block p { max-width: 760px; margin: 0 auto; color: #475569; font-size: 1.08rem; }
.contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 22px; margin-top: 28px; }
.contact-card { background: #fff; border: 1px solid #edf2ff; border-radius: 22px; padding: 24px; box-shadow: 0 12px 28px rgba(79,70,229,.08); }
.contact-card h3 { margin: 0 0 12px; }
.contact-card p { margin: 0; color: #475569; font-size: 1.06rem; }
</style>
