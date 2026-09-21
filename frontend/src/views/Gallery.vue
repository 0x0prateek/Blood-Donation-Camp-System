<template>
  <div class="public-page">
    <button class="back-btn" @click="$router.push('/')">
      <i class="bi bi-arrow-left"></i> Back
    </button>

    <div class="section-head">
      <p class="eyebrow">Camp gallery</p>
      <h1>Moments from recent DotLife donation drives</h1>
    </div>

    <div class="gallery-grid">
      <div v-for="item in galleryItems" :key="item.title" class="gallery-card">
        <div class="image-box" :style="{ background: item.gradient }">
          <span>{{ item.short }}</span>
        </div>
        <div class="gallery-copy">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const galleryItems = [
  {
    title: 'Community drive',
    short: 'C1',
    gradient: 'linear-gradient(135deg, #ef4444, #fca5a5)',
    description: 'A volunteer-led blood donation camp that brought together donors and local healthcare teams.'
  },
  {
    title: 'Emergency response',
    short: 'C2',
    gradient: 'linear-gradient(135deg, #4f46e5, #a5b4fc)',
    description: 'Fast donor matching and camp coordination helped staff respond to urgent blood requests.'
  },
  {
    title: 'Campus campaign',
    short: 'C3',
    gradient: 'linear-gradient(135deg, #0ea5e9, #7dd3fc)',
    description: 'Students and staff joined the blood drive as part of a campus awareness and donation effort.'
  },
  {
    title: 'City outreach',
    short: 'C4',
    gradient: 'linear-gradient(135deg, #22c55e, #86efac)',
    description: 'A neighbourhood camp where donors registered, screened, and contributed in a smooth flow.'
  }
]
</script>

<style scoped>
.public-page { max-width: 1100px; margin: 0 auto; padding: 88px 24px 80px; position: relative; }
.back-btn { position: absolute; top: 28px; left: 24px; border: 1px solid #dbe2f1; background: #fff; color: #0f172a; border-radius: 999px; padding: 10px 16px; font-weight: 600; box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06); }
.back-btn:hover { background: #f8faff; }
.section-head { text-align: center; margin-bottom: 30px; }
.eyebrow { text-transform: uppercase; letter-spacing: .14em; font-weight: 700; color: #4f46e5; font-size: .72rem; }
.section-head h1 { font-size: clamp(2rem, 4vw, 3.3rem); font-weight: 800; color: #0f172a; margin-top: 12px; }
.gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 22px; }
.gallery-card { background: #fff; border-radius: 22px; overflow: hidden; border: 1px solid #edf2ff; box-shadow: 0 12px 30px rgba(15, 23, 42, .06); }
.image-box { height: 220px; display: grid; place-items: center; color: #fff; font-size: 3rem; font-weight: 800; }
.gallery-copy { padding: 20px; }
.gallery-copy h3 { margin: 0 0 10px; font-size: 1.2rem; }
.gallery-copy p { margin: 0; color: #475569; }
</style>
