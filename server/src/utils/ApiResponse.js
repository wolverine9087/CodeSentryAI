export default function ApiResponse(res, data = {}, status = 200) {
  return res.status(status).json({
    success: true,
    ...data
  });
}
