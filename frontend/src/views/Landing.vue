<template>
  <div class="site">
    <!-- ═══════════════ NAVBAR ═══════════════ -->
    <nav class="navbar navbar-expand-lg fixed-top site-nav" :class="{ scrolled: isScrolled }">
      <div class="container">
        <router-link to="/" class="navbar-brand d-flex align-items-center gap-2">
          <img src="/favicon.svg" alt="DotLife" width="34" height="34" class="brand-mark">
          <span class="brand-name">DotLife</span>
        </router-link>
        <button class="navbar-toggler border-0" type="button" @click="navOpen = !navOpen">
          <i class="bi" :class="navOpen ? 'bi-x-lg' : 'bi-list'"></i>
        </button>
        <div class="nav-links" :class="{ open: navOpen }">
          <a href="#features" @click="navOpen = false">Features</a>
          <a href="#how-it-works" @click="navOpen = false">How It Works</a>
          <a href="#impact" @click="navOpen = false">Impact</a>
          <a href="#contact" @click="navOpen = false">Contact</a>
          <router-link to="/admin/login" class="btn btn-nav-login">
            <i class="bi bi-box-arrow-in-right me-1"></i> Admin Login
          </router-link>
        </div>
      </div>
    </nav>

    <!-- ═══════════════ HERO ═══════════════ -->
    <header class="hero">
      <div class="container">
        <div class="row align-items-center gy-5">
          <div class="col-lg-6">
            <span class="eyebrow">
              <i class="bi bi-heart-pulse-fill me-1"></i> Blood Donation Camp Management Platform
            </span>
            <h1 class="hero-title">
              Every donor,<br>every camp,<br>
              <span class="text-accent">one system.</span>
            </h1>
            <p class="hero-lead">
              DotLife brings donor records, camp scheduling, on-site registration, budgets and
              multi-channel outreach together - replacing paper registers and scattered spreadsheets
              with one platform your organising committee can actually run a camp from.
            </p>
            <div class="d-flex flex-wrap gap-3 mt-4">
              <router-link to="/donor/register" class="btn btn-cta-primary">
                <i class="bi bi-droplet-fill me-2"></i> Become a Donor
              </router-link>
              <router-link to="/admin/login" class="btn btn-cta-secondary">
                Organiser Login <i class="bi bi-arrow-right ms-1"></i>
              </router-link>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="hero-stat-card">
              <div class="hero-stat-header">
                <i class="bi bi-graph-up-arrow"></i> Live Platform Snapshot
              </div>
              <div class="row g-3 mt-1">
                <div class="col-6" v-for="s in heroStats" :key="s.label">
                  <div class="hero-stat-tile">
                    <div class="hero-stat-value">{{ s.value }}</div>
                    <div class="hero-stat-label">{{ s.label }}</div>
                  </div>
                </div>
              </div>
              <div class="hero-stat-footnote">
                <i class="bi bi-shield-check me-1"></i> Figures update automatically from live camp records.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-wave"></div>
    </header>

    <!-- ═══════════════ FEATURES ═══════════════ -->
    <section id="features" class="section">
      <div class="container">
        <div class="section-heading">
          <span class="section-kicker">What's inside</span>
          <h2>Everything an organising committee needs</h2>
          <p>One admin console covers the whole lifecycle of a blood donation drive.</p>
        </div>

        <div class="row g-4">
          <div class="col-md-6 col-lg-3" v-for="f in features" :key="f.title">
            <div class="feature-card">
              <div class="feature-icon" :style="{ background: f.bg }">
                <i :class="f.icon"></i>
              </div>
              <h5>{{ f.title }}</h5>
              <p>{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ HOW IT WORKS ═══════════════ -->
    <section id="how-it-works" class="section section-alt">
      <div class="container">
        <div class="section-heading">
          <span class="section-kicker">Workflow</span>
          <h2>From walk-in to donor record in four steps</h2>
          <p>Built around how a real camp desk works - fast lookups, no duplicate entries.</p>
        </div>

        <div class="workflow">
          <div class="workflow-step" v-for="(step, i) in workflow" :key="step.title">
            <div class="workflow-num">{{ i + 1 }}</div>
            <h5>{{ step.title }}</h5>
            <p>{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ IMPACT ═══════════════ -->
    <section id="impact" class="section impact-section">
      <div class="container">
        <div class="section-heading light">
          <span class="section-kicker">Impact</span>
          <h2>Numbers pulled straight from the database</h2>
          <p>No marketing estimates - this is the same data organisers see on the Reports page.</p>
        </div>

        <div class="row g-4 text-center">
          <div class="col-6 col-lg-3" v-for="s in impactStats" :key="s.label">
            <div class="impact-tile">
              <div class="impact-value">{{ s.value }}</div>
              <div class="impact-label">{{ s.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ TRUST / STACK ═══════════════ -->
    <section class="section">
      <div class="container">
        <div class="section-heading">
          <span class="section-kicker">Built to last</span>
          <h2>Secure, containerised, and built on a real stack</h2>
        </div>
        <div class="row g-4">
          <div class="col-md-4" v-for="t in trust" :key="t.title">
            <div class="trust-card">
              <i :class="t.icon"></i>
              <h6>{{ t.title }}</h6>
              <p>{{ t.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ CONTACT / CTA ═══════════════ -->
    <section id="contact" class="section cta-section">
      <div class="container text-center">
        <h2>Ready to organise your next camp?</h2>
        <p>Sign in to the admin console to manage donors, schedule a camp, or send an emergency alert.</p>
        <div class="d-flex flex-wrap justify-content-center gap-3 mt-4">
          <router-link to="/donor/register" class="btn btn-cta-primary">
            <i class="bi bi-droplet-fill me-2"></i> I want to donate blood
          </router-link>
          <router-link to="/admin/login" class="btn btn-cta-secondary">
            <i class="bi bi-speedometer2 me-2"></i> Organiser Login
          </router-link>
        </div>
      </div>
    </section>

    <!-- ═══════════════ FOOTER ═══════════════ -->
    <footer class="site-footer">
      <div class="container">
        <div class="row gy-4">
          <div class="col-md-4">
            <div class="d-flex align-items-center gap-2 mb-2">
              <img src="/favicon.svg" alt="DotLife" width="28" height="28">
              <span class="brand-name text-white">DotLife</span>
            </div>
            <p class="footer-tagline">A small contribution can save a life.</p>
          </div>
          <div class="col-md-4">
            <h6>Platform</h6>
            <ul class="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#impact">Impact</a></li>
            </ul>
          </div>
          <div class="col-md-4">
            <h6>Administration</h6>
            <ul class="footer-links">
              <li><router-link to="/admin/login">Organiser Login</router-link></li>
              <li><router-link to="/donor/login">Donor Login</router-link></li>
              <li><router-link to="/donor/register">Donor Registration</router-link></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          &copy; {{ year }} DotLife Blood Donation Camp System. Built with Vue 3, Node.js and MySQL.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const navOpen = ref(false)
const isScrolled = ref(false)
const year = new Date().getFullYear()

const stats = reactive({
  total_donors: 0,
  total_camps: 0,
  total_donations: 0,
  blood_groups_covered: 0,
  estimated_lives_impacted: 0
})

const fmt = (n) => Number(n || 0).toLocaleString('en-US')

const heroStats = computed(() => [
  { label: 'Active Donors', value: fmt(stats.total_donors) },
  { label: 'Camps Organised', value: fmt(stats.total_camps) },
  { label: 'Successful Donations', value: fmt(stats.total_donations) },
  { label: 'Blood Groups Covered', value: `${stats.blood_groups_covered} / 8` },
])

const impactStats = computed(() => [
  { label: 'Registered Active Donors', value: fmt(stats.total_donors) },
  { label: 'Camps Run to Date', value: fmt(stats.total_camps) },
  { label: 'Confirmed Donations', value: fmt(stats.total_donations) },
  { label: 'Estimated Lives Impacted', value: fmt(stats.estimated_lives_impacted) },
])

const features = [
  { title: 'Donor Management', icon: 'bi bi-people-fill', bg: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    desc: 'Searchable donor roll with blood-group and eligibility filtering, Excel import/export and duplicate detection.' },
  { title: 'Blood Camps', icon: 'bi bi-tent-fill', bg: 'linear-gradient(135deg,#f59e0b,#d97706)',
    desc: 'Schedule camps, track status and set a planned budget for every drive you organise.' },
  { title: 'Camp Register', icon: 'bi bi-clipboard2-pulse-fill', bg: 'linear-gradient(135deg,#22c55e,#16a34a)',
    desc: 'A digital attendance book by mobile number - instantly tells you known donor, walk-in, or already registered.' },
  { title: 'Budget & Donations', icon: 'bi bi-wallet2', bg: 'linear-gradient(135deg,#ec4899,#db2777)',
    desc: 'Cash and in-kind contributions tracked separately from spend, with a live running balance.' },
  { title: 'Multi-Channel Messaging', icon: 'bi bi-whatsapp', bg: 'linear-gradient(135deg,#25d366,#128c7e)',
    desc: 'Bulk WhatsApp and SMS campaigns, chunked and de-duplicated so nobody is messaged twice.' },
  { title: 'Message Templates', icon: 'bi bi-chat-square-text-fill', bg: 'linear-gradient(135deg,#3b82f6,#2563eb)',
    desc: 'Reusable, Meta-approved templates in English and Sinhala for camp notices and alerts.' },
  { title: 'Emergency Alerts', icon: 'bi bi-exclamation-triangle-fill', bg: 'linear-gradient(135deg,#ef4444,#b91c1c)',
    desc: 'One click reaches every active donor of the blood group a hospital urgently needs.' },
  { title: 'Reports & Analytics', icon: 'bi bi-bar-chart-line-fill', bg: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    desc: 'Date-filtered donor, camp and messaging analytics with one-click Excel export.' },
]

const workflow = [
  { title: 'Look Up by Mobile', desc: 'The camp desk enters a T.P. number - the system instantly says known donor, walk-in, or already on today’s register.' },
  { title: 'Confirm or Register', desc: 'Existing details pre-fill for known donors; new walk-ins are added to the master donor list in the same step.' },
  { title: 'Record the Outcome', desc: 'Mark Donated, Rejected or No-Show - the donor’s last-donation date updates automatically.' },
  { title: 'Report & Follow Up', desc: 'Reports and camp summaries update live; eligible donors can be messaged for the next camp in a click.' },
]

const trust = [
  { icon: 'bi bi-shield-lock-fill', title: 'Secured by Design',
    desc: 'JWT sessions in httpOnly cookies, bcrypt password hashing, login throttling and parameterised queries throughout.' },
  { icon: 'bi bi-boxes', title: 'Containerised Stack',
    desc: 'Vue 3, Node.js/Express and MySQL each run in their own container, orchestrated with Docker or Podman Compose.' },
  { icon: 'bi bi-cloud-arrow-up-fill', title: 'Deploy Anywhere',
    desc: 'OCI-compliant images run identically on a laptop, a VPS, or Railway.app.' },
]

const fetchStats = async () => {
  try {
    const res = await axios.get('/api/public/stats')
    if (res.data?.success) {
      Object.assign(stats, res.data.data)
    }
  } catch (e) {
    // Public landing page still works with zeroed stats if the API is unreachable.
  }
}

const showDonorInfo = () => {
  Swal.fire({
    title: 'Want to donate blood?',
    html: 'Visit your nearest blood camp or hospital blood bank to register as a donor.<br>' +
          'Organisers: sign in to the admin console to add donors and schedule camps.',
    icon: 'info',
    confirmButtonText: 'Got it',
    confirmButtonColor: '#6366f1'
  })
}

const onScroll = () => { isScrolled.value = window.scrollY > 20 }

onMounted(() => {
  fetchStats()
  window.addEventListener('scroll', onScroll)
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.site {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #1e2433;
  background: #ffffff;
  overflow-x: hidden;
}

/* ── Navbar ─────────────────────────────────────────────── */
.site-nav {
  padding: 1.1rem 0;
  transition: all 0.25s ease;
  background: transparent;
}
.site-nav.scrolled {
  padding: 0.65rem 0;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0,0,0,0.06);
}
.brand-mark { border-radius: 8px; }
.brand-name { font-weight: 800; font-size: 1.35rem; color: #1e2433; letter-spacing: -0.5px; }
.nav-links { display: flex; align-items: center; gap: 1.9rem; margin-left: auto; }
.nav-links a:not(.btn) {
  color: #4b5563; text-decoration: none; font-weight: 600; font-size: 0.95rem;
  transition: color 0.2s;
}
.nav-links a:not(.btn):hover { color: #6366f1; }
.btn-nav-login {
  background: #1e2433; color: #fff; border-radius: 50px; padding: 0.5rem 1.3rem;
  font-weight: 600; font-size: 0.9rem; border: none;
}
.btn-nav-login:hover { background: #6366f1; color: #fff; }

@media (max-width: 991px) {
  .nav-links {
    position: fixed; top: 68px; left: 0; right: 0; background: #fff;
    flex-direction: column; align-items: flex-start; gap: 1.2rem; padding: 1.5rem 2rem;
    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
    display: none;
  }
  .nav-links.open { display: flex; }
  .btn-nav-login { width: 100%; text-align: center; }
}

/* ── Hero ───────────────────────────────────────────────── */
.hero {
  position: relative;
  padding: 9.5rem 0 6rem;
  background: radial-gradient(circle at 85% 10%, rgba(99,102,241,0.10), transparent 45%),
              radial-gradient(circle at 10% 90%, rgba(220,38,38,0.06), transparent 40%),
              #fafbff;
  overflow: hidden;
}
.eyebrow {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: rgba(99,102,241,0.1); color: #4f46e5; font-weight: 700; font-size: 0.82rem;
  padding: 0.45rem 1rem; border-radius: 50px; margin-bottom: 1.5rem;
}
.hero-title {
  font-size: 3.1rem; font-weight: 900; line-height: 1.1; letter-spacing: -1.5px; color: #14182a;
}
.text-accent { color: #dc2626; }
.hero-lead { font-size: 1.08rem; color: #5b6272; max-width: 540px; margin-top: 1.3rem; line-height: 1.7; }

.btn-cta-primary {
  background: linear-gradient(135deg,#dc2626,#b91c1c); color: #fff; border: none;
  border-radius: 50px; padding: 0.85rem 1.8rem; font-weight: 700;
  box-shadow: 0 10px 25px rgba(220,38,38,0.28);
}
.btn-cta-primary:hover { color: #fff; transform: translateY(-2px); }
.btn-cta-secondary {
  background: #fff; color: #1e2433; border: 2px solid #e5e7eb;
  border-radius: 50px; padding: 0.8rem 1.8rem; font-weight: 700;
}
.btn-cta-secondary:hover { border-color: #6366f1; color: #6366f1; }

.hero-stat-card {
  background: #14182a; border-radius: 24px; padding: 2rem;
  box-shadow: 0 30px 60px rgba(20,24,42,0.25);
}
.hero-stat-header {
  color: #9ca3af; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;
}
.hero-stat-tile {
  background: rgba(255,255,255,0.06); border-radius: 14px; padding: 1.1rem;
  border: 1px solid rgba(255,255,255,0.08);
}
.hero-stat-value { font-size: 1.9rem; font-weight: 800; color: #fff; font-variant-numeric: tabular-nums; }
.hero-stat-label { font-size: 0.8rem; color: #9ca3af; margin-top: 0.2rem; }
.hero-stat-footnote { color: #6b7280; font-size: 0.78rem; margin-top: 1.2rem; }

.hero-wave { height: 1px; }

/* ── Sections (shared) ─────────────────────────────────── */
.section { padding: 5.5rem 0; }
.section-alt { background: #f8f9fc; }
.section-heading { max-width: 640px; margin: 0 auto 3rem; text-align: center; }
.section-kicker {
  display: inline-block; color: #6366f1; font-weight: 700; font-size: 0.82rem;
  text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.6rem;
}
.section-heading h2 { font-weight: 800; font-size: 2rem; letter-spacing: -0.5px; color: #14182a; }
.section-heading p { color: #6b7280; margin-top: 0.7rem; }
.section-heading.light .section-kicker { color: #c7d2fe; }
.section-heading.light h2, .section-heading.light p { color: #fff; }
.section-heading.light p { color: rgba(255,255,255,0.75); }

/* ── Feature cards ──────────────────────────────────────── */
.feature-card {
  background: #fff; border: 1px solid #eef0f4; border-radius: 18px; padding: 1.8rem;
  height: 100%; transition: all 0.25s ease;
}
.feature-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(20,24,42,0.08); }
.feature-icon {
  width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 1.35rem; margin-bottom: 1.1rem;
}
.feature-card h5 { font-weight: 700; margin-bottom: 0.5rem; }
.feature-card p { color: #6b7280; font-size: 0.9rem; margin: 0; line-height: 1.55; }

/* ── Workflow ───────────────────────────────────────────── */
.workflow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
.workflow-step { background: #fff; border-radius: 18px; padding: 2rem 1.5rem; text-align: center; position: relative; border: 1px solid #eef0f4; }
.workflow-num {
  width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg,#6366f1,#4f46e5);
  color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800;
  margin: 0 auto 1.1rem; font-size: 1.1rem;
}
.workflow-step h5 { font-weight: 700; font-size: 1rem; }
.workflow-step p { color: #6b7280; font-size: 0.87rem; margin-top: 0.4rem; line-height: 1.5; }
@media (max-width: 991px) { .workflow { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 575px) { .workflow { grid-template-columns: 1fr; } }

/* ── Impact ─────────────────────────────────────────────── */
.impact-section { background: linear-gradient(135deg,#14182a 0%, #1e1b4b 100%); }
.impact-tile { padding: 1rem; }
.impact-value { font-size: 2.6rem; font-weight: 900; color: #fff; font-variant-numeric: tabular-nums; }
.impact-label { color: rgba(255,255,255,0.65); font-size: 0.85rem; margin-top: 0.4rem; font-weight: 600; }

/* ── Trust cards ────────────────────────────────────────── */
.trust-card { text-align: center; padding: 1.5rem; }
.trust-card i { font-size: 2.2rem; color: #6366f1; margin-bottom: 1rem; display: block; }
.trust-card h6 { font-weight: 700; margin-bottom: 0.5rem; }
.trust-card p { color: #6b7280; font-size: 0.88rem; line-height: 1.55; }

/* ── CTA ────────────────────────────────────────────────── */
.cta-section { background: #f8f9fc; }
.cta-section h2 { font-weight: 800; font-size: 2rem; color: #14182a; }
.cta-section p { color: #6b7280; margin-top: 0.6rem; }

/* ── Footer ─────────────────────────────────────────────── */
.site-footer { background: #14182a; color: #9ca3af; padding: 3.5rem 0 1.5rem; }
.site-footer h6 { color: #fff; font-weight: 700; margin-bottom: 1rem; font-size: 0.9rem; }
.footer-tagline { font-size: 0.88rem; color: #9ca3af; }
.footer-links { list-style: none; padding: 0; margin: 0; }
.footer-links li { margin-bottom: 0.6rem; }
.footer-links a { color: #9ca3af; text-decoration: none; font-size: 0.88rem; }
.footer-links a:hover { color: #fff; }
.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.08); margin-top: 2.5rem; padding-top: 1.5rem;
  font-size: 0.8rem; text-align: center; color: #6b7280;
}

@media (max-width: 767px) {
  .hero { padding: 8rem 0 4rem; }
  .hero-title { font-size: 2.2rem; }
}
</style>
