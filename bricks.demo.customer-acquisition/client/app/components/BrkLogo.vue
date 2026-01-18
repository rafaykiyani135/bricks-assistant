<template>
  <svg xmlns="http://www.w3.org/2000/svg" :class="class" fill="none" viewBox="0 0 62 4">
    <path fill="#fff" d="M3.139.782V0H0v.755h.77v.785H0v2.373h3.139v-.782h.783V.781H3.14Zm-.818 2.35h-.753v-.783h.753v.782Zm0-1.568h-.753V.782h.753v.782ZM12.737 1.564V.782h-.784V0H8.814v3.913h1.568v-.782h-.787v-.785h.787v.785h.784v.782h1.567v-.782h-.783V1.564h.787Zm-1.571 0h-.784V.782h.784v.782Z"/>
    <path :fill="kColor" d="M27.988 3.913V0h1.568v.782h.784V0h1.567v.782h-.784v.782h-.783v.782h.783v.782h.784v.782H30.34V3.13h-.784v.782h-1.568Z"/>
    <path fill="#fff" d="M61.314.782V0h-3.138v3.913h3.138v-.782h-2.347V2.35H61.313v-.785h-1.567V.782h1.567ZM16.898 0v1.56h.788v.786h-.788v1.567h1.571V0H16.9ZM25.582 1.564V.782H24.8V0h-2.352v.782h-.787v2.35H23.231V.781h.784v.782h1.567Z"/>
    <path fill="#fff" d="M24.8 3.913v-.782h.784V2.35h-1.568v.782h-.784v.782H24.8ZM38.303 1.564V.782h-.787V0h-2.351v.782h-.784v.778h.787v.786h-.787v.785h.784v.782h2.351v-.782h.787V2.35h-1.57v.782h-.785V.781h.784v.783h1.571ZM44.648 2.346h.784V.782h-.784V0h-2.355v.782h-.783v2.35h.784v.781h2.354V2.346Zm-.784.755h-.783V.812h.783v2.289ZM52.592.782V0h-3.139v3.913h3.139v-.782h.783V.781h-.783Zm-.818 2.35h-.753V1.566h-.788V.782h1.541v2.35Z"/>
  </svg>
</template>

<script>
  export default {
    props: {
      kColor: {
        type: String,
        required: true,
        default: "#fff"
      },
      class: {
        type: String,
        required: false, 
      }
    }
  }
</script>
