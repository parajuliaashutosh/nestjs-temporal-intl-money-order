export async function sendEmail(to: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`Sending email to ${to}`);
}
