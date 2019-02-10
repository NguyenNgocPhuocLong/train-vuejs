<template>
  <div class="about">
    <h1>Hello! {{name_dev}}. This is an about page</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna ali...</p>
  </div>
</template>
<script>
export default {
  name: "About",
  data() {
    return {
      name_dev: !this.$route.params.name
        ? "Font-End Dev"
        : this.$route.params.name
    };
  }
};
</script>
<style scoped>
</style>
