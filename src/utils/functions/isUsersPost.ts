export function isUsersPage(
  title: string,
  username: string,
  checkUsersPage: boolean,
): boolean {
  const array = title.split(":");
  if (array[0].toLowerCase() === "user") {
    const titleArray = array[1].split("/");
    if (checkUsersPage) {
      if (titleArray[0].toLowerCase() === username.toLowerCase()) {
        if (checkUsersPage) {
          return titleArray.length > 1;
        }
        return true;
      }
      return false;
    }
  } else {
    return false;
  }
  return false;
}
