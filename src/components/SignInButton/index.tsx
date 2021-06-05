import { FaGithub } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import styles from "./styles.module.scss";

export function SignInButton() {
  const isUserLoggedInd = true;

  return isUserLoggedInd ? (
    <button type="button" className={styles.sigInButton}>
      <FaGithub color="#04d361" /> Diego Henrique Oliveira{" "}
      <FiX color="#737380" className={styles.closeIcon} />
    </button>
  ) : (
    <button type="button" className={styles.sigInButton}>
      <FaGithub color="#eba417" /> Sign in with Github
    </button>
  );
}
