import assertString from "validator/lib/util/assertString";

const wxReg = /^[a-zA-Z]{1}[-_a-zA-Z0-9]{5,19}$/;

export default function isWechatHandle(str) {
  assertString(str);
  return wxReg.test(str);
}
