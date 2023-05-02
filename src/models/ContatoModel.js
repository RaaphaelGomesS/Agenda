const mongoose = require("mongoose");
const validator = require("validator");

const ContatoSchema = new mongoose.Schema({
  name: { type: String, reqired: true },
  lastName: { type: String, reqired: false, default: "" },
  email: { type: String, reqired: false, default: "" },
  phone: { type: String, reqired: false, default: "" },
  created: { type: Date, default: Date.now },
});

const ContatoModel = mongoose.model("Contato", ContatoSchema);

function Contato(body) {
  this.body = body;
  this.errors = [];
  this.contato = null;
}

Contato.prototype.register = async function () {
  this.validate();

  if (this.errors.length > 0) return;

  this.contato = await ContatoModel.create(this.body);
};

Contato.prototype.validate = function () {
  this.cleanUp();

  if (this.body.email && !validator.isEmail(this.body.email)) {
    this.errors.push("E-mail inválido");
  }

  if (!this.body.name) {
    this.errors.push("Nome é um campo obrigatório.");
  }

  if (!this.body.email && !this.body.phone) {
    this.errors.push("Deve ser cadastrado pelo menos um dos dois contatos.");
  }
};

Contato.prototype.cleanUp = function () {
  for (const key in this.body) {
    if (typeof this.body[key] !== "string") {
      this.body[key] = "";
    }
  }

  this.body = {
    name: this.body.name,
    lastName: this.body.lastName,
    email: this.body.email,
    phone: this.body.phone,
  };
};

Contato.prototype.edit = async function (id) {
  if (typeof id !== "string") return;
  this.validate();

  if (this.errors.length > 0) return;

  this.contato = await ContatoModel.findByIdAndUpdate(id, this.body, {
    new: true,
  });
};

Contato.searchId = async (id) => {
  if (typeof id !== "string") return;

  const contato = await ContatoModel.findById(id);
  return contato;
};

Contato.searchContatos = async () => {
  const contatos = await ContatoModel.find().sort({ created: -1 });
  return contatos;
};

Contato.delete = async (id) => {
  if (typeof id !== "string") return;

  const contato = await ContatoModel.findOneAndDelete({ _id: id });
  return contato;
};

module.exports = Contato;
