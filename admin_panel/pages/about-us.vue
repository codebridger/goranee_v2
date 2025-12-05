<template>
  <dir class="flex">
    <card class="container">
      <p>
        <span>
          وبسایت گورانی مرجع آکورد های کوردی است که با شور علاقه قلبی آن را
          طراحی کردیم و اکنون در دسترس شما ای که دوست داری کوردی بخونی قرار
          گرفته.
        </span>
        <br /><br />
        <span>
          ما سعی میکنیم در طول زمان جنبه های مختلف گورانی رو بهتر کنیم تا تجربه
          کاربری خوبی برای شما بوجود بیاوریم.
        </span>
      </p>
      <br />
      <p>فعلا تیم کوچیکی داریم اما احتمالا در آینده تعدادمون بیشتر میشه:</p>
      <br />
      <ul>
        <li>
          <span> پویا جلالی </span><br />
          <span class="gray"> موسیقی دان و مهندس مکانیک </span>
        </li>
        <br />
        <li>
          <span>نوید شاد</span><br />
          <span class="gray"> علاقمند به موسیقی و مهندس نرم افزار </span>
        </li>
      </ul>
      <br />
      <p>
        هر ترانه به همراه ملودی آن در وبسایت قرار گرفته، در صورتی که ترانه مورد
        نظر خود را نیافتی به ما اطلاع بده تا در صورت تایید در برنامه تولید
        محتوای وبسایت قرارش بدیم.
      </p>

      <p style="margin-top: 20px; color: blue">
        <a target="_blank" href="https://forms.gle/nd6jY73D33Y3rBrW7"
          ><span>فرم تماس با ما</span></a
        >
      </p>
    </card>
  </dir>
</template>

<script>
export default {
  head() {
    return {
      title: "درباره وبسایت گورانی",
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "about-us",
          name: "description",
          content:
            "مرجع آکورد های کوردی است که با شور علاقه قلبی آن را طراحی کردیم",
        },
      ],
    };
  },

  mounted() {
    this.$gtag("config", {
      page_path: this.$route.path,
    });
  },
};
</script>

<style scoped>
.container {
  padding: 16px;
  direction: rtl;
  max-width: 400px;
}
.flex {
  display: flex;
  justify-content: center;
  width: 100%;
}
.gray {
  color: gray;
  font-size: 14px;
}
</style>
