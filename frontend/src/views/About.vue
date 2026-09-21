<template>
  <div class="public-page">
    <button class="back-btn" @click="$router.push('/')">
      <i class="bi bi-arrow-left"></i> Back
    </button>

    <div class="hero-block">
      <p class="eyebrow">About DotLife</p>
      <h1>Saving lives together through better donor coordination.</h1>
      <p>
        DotLife helps blood donation organisations track donors, schedule camps, and respond to urgent needs faster.
        The platform brings the public, donor records, and organising teams into one secure system.
      </p>
    </div>

    <div class="info-grid">
      <div class="info-card">
        <h3>Our mission</h3>
        <p>To make blood donation easier, more transparent, and more accessible across communities.</p>
      </div>
      <div class="info-card">
        <h3>Who it helps</h3>
        <p>Donors, hospitals, blood camp organisers, and volunteer teams working to improve emergency response.</p>
      </div>
      <div class="info-card">
        <h3>Why it matters</h3>
        <p>Every donor record and camp update can help connect the right blood group to someone who needs it quickly.</p>
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
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 22px; margin-top: 36px; }
.info-card { background: #fff; border: 1px solid #edf2ff; border-radius: 22px; padding: 24px; box-shadow: 0 12px 28px rgba(79,70,229,.08); }
.info-card h3 { margin-top: 0; margin-bottom: 10px; font-size: 1.25rem; }
.info-card p { margin: 0; color: #475569; }
</style>
