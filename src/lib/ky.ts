import ky from "ky";

const kyInstance = ky.create({
  credentials: 'include',
  hooks: {
    beforeError: [
      async (error) => {
        const { response } = error;
        if (response && response.body) {
          try {
            const body = await response.json();
            error.message = body.error || error.message;
          } catch {
            // Use default error message if JSON parsing fails
          }
        }
        return error;
      },
    ],
  },
  parseJson: (text) =>
    JSON.parse(text, (key, value) => {
      if (key.endsWith("At")) return new Date(value);
      return value;
    }),
});

export default kyInstance;
