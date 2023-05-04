export default (event) => ({
  code: "ERRINTERNAL",
  event: event,
  message: "internal server error",
  detail: "request caused an internal error on the server",
});
