const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const LoginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const LoginModel = mongoose.model("Login", LoginSchema);

class Login {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.user = null;
  }

  async login() {
    this.validate();
    if (this.errors.length > 0) return;
    this.user = await LoginModel.findOne({ email: this.body.email });

    if (!this.user) {
      this.errors.push("Usuário não existe!");
      return;
    }

    if (bcrypt.compareSync(this.body.password, this.user.password)) {
      this.errors.push("Senha inválida!");
      this.user = null;
      return;
    }
  }

  async register() {
    this.validate();
    if (this.errors.length > 0) return;

    await this.userExists();

    if (this.errors.length > 0) return;

    const salt = bcrypt.genSaltSync();
    this.body.password = bcrypt.hashSync(this.body.password, salt);

    this.user = await LoginModel.create(this.body);
  }

  async userExists() {
    this.user = await LoginModel.findOne({ email: this.body.email });

    if (this.user) {
      this.errors.push("Esse email já está cadastrado.");
    }
  }

  validate() {
    this.cleanUp();

    const pass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    if (!validator.isEmail(this.body.email)) {
      this.errors.push("E-mail inválido");
    }

    if (!this.body.password.match(pass)) {
      this.errors.push(
        "A senha deve ter entre 6 e 20 caracteres contendo pelo menos um número, uma letra maiúscula e uma letra minúscula"
      );
    }
  }

  cleanUp() {
    for (const key in this.body) {
      if (typeof this.body[key] !== "string") {
        this.body[key] = "";
      }
    }

    this.body = {
      email: this.body.email,
      password: this.body.password,
    };
  }
}

module.exports = Login;
