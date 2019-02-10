<template>
  <div class="container">
    <div class="holder">
      <form @submit.prevent="addSkill">
        <input
          type="text"
          placeholder="Enter a skill you have..."
          v-model="skill"
          v-validate="'min:5'"
          name="skill"
        >
        <transition
          name="alert-in"
          enter-active-class="animated flipInX"
          leave-active-class="animated flipOutX"
        >
          <p class="alert" v-if="errors.has('skill')">{{errors.first('skill')}}</p>
        </transition>
      </form>
      <ul>
        <transition-group
          name="list"
          enter-active-class="animated bounceInUp"
          leave-active-class="animated bounceOutDown"
        >
          <li v-for="data in skills" :key="data.id">
            {{data.skill}}
            <i class="fa fa-minus-circle float-right" v-on:click="remove(data.id)"></i>
          </li>
        </transition-group>
      </ul>

      <!---->
      <p v-if="skills.length >=1">You have more than one skill</p>
      <p v-else>You have less than or equal to 1 skill</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Skills",
  props: {},
  data() {
    return {
      skill: "",
      skills: [
        { id: 0, skill: "Vue.js" },
        { id: 1, skill: "Fontend Developer" }
      ]
    };
  },
  methods: {
    changeName() {
      this.name = "Long ";
    },
    addSkill() {
      this.$validator.validateAll().then(result => {
        if (result) {
          this.skills.push({ id: this.skills.length + 1, skill: this.skill });
          this.skill = "";
        }
      });
    },
    remove(id) {
      let index = this.skills.findIndex(s => s.id === id);
      if (index != -1) {
        this.skills.splice(index, 1);
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import "https://cdn.jsdelivr.net/npm/animate.css@3.5.1";
.holder {
  background: #fff;
}

ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}
ul li {
  padding: 20px;
  font-size: 1.3em;
  background-color: #e0edf4;
  border-left: 5px solid #3eb3f6;
  margin-bottom: 2px;
  color: #3e5252;
}

p {
  text-align: center;
  padding: 30px 0;
  color: gray;
}

.container {
  box-shadow: 0px 0px 40px lightgray;
}

input {
  width: calc(100% - 40px);
  border: 0;
  padding: 20px;
  font-size: 1.3em;
  background-color: #323333;
  color: #687f7f;
}

.alert {
  background: #fdf2ce;
  font-weight: bold;
  display: inline-block;
  padding: 5px;
  margin-top: -20px;
}
</style>
