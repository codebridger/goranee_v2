<template>
  <div class="flex flex-col" dir="rtl">
    <label for="seo">عناوین دیگر برای SEO</label>
    <textarea 
	:value="value" 
	@input="$emit('input', $event.target.value)" 
	name="seo"
	rows="5"
	/>
	
  </div>
</template>

<script>
export default {
  props: {
    value: { type: String },
  },
};
</script>

<style scoped>
textarea {
	background: #f4f7f8;
	border-radius: 8px;
	padding: 4px 8px;
}
</style>