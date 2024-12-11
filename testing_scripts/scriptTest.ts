try {
  // if (!schedule.result) {
  //   console.log(schedule.issues[0]);
  // } else {
  //   console.log(schedule.result);
  // }
  // const years: number[] = [];
  // results.map((result) => {
  //   if (!years.includes(result.Year)) {
  //     years.push(result.Year);
  //   }
  // });
  // years.forEach((year) => {
  //   const resultsByYear = results.filter((result) => result.Year === year);
  //   console.table(resultsByYear);
  // });
} catch (error) {
  if (error instanceof Error) {
    console.error("Error message:", error.message);
  }
  console.error("Unknown error:", error);
}
