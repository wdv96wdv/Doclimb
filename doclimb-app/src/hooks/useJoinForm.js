import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  checkEmailAvailable,
  checkNicknameAvailable,
} from "../services/profile";
import { validatePasswordPair } from "../utils/passwordValidation";
import { showError, showSuccess, showWarning } from "../utils/notify";
import Swal from "sweetalert2";
import {
  EMAIL_DOMAINS,
  EMAIL_ID_REGEX,
  EMAIL_REGEX,
  BLOCKED_EMAIL_DOMAINS,
} from "../pages/Join/joinConstants";

export function useJoinForm() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const nicknameRef = useRef(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [displayNickname, setDisplayNickname] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [climbingLevel, setClimbingLevel] = useState("");
  const [preferredGym, setPreferredGym] = useState("");
  const [climbingStyle, setClimbingStyle] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("gmail.com");

  const getFullEmail = () => `${emailId}@${emailDomain}`;

  const canSubmit =
    isAgreed &&
    isEmailChecked &&
    isNicknameChecked &&
    password &&
    confirmPassword &&
    password === confirmPassword;

  const handleNicknameChange = (e) => {
    const filtered = e.target.value.replace(
      /[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g,
      ""
    );
    setDisplayNickname(filtered);
    setIsNicknameChecked(false);
  };

  const handleEmailIdChange = (e) => {
    const filtered = e.target.value.replace(/[^a-zA-Z0-9._%+-]/g, "");
    setEmailId(filtered);
    setIsEmailChecked(false);
  };

  const handleEmailDomainChange = (domain) => {
    setEmailDomain(domain);
    setIsEmailChecked(false);
  };

  const checkEmailDuplicate = async () => {
    const email = getFullEmail();

    if (!emailId) {
      return Swal.fire("이메일 아이디를 입력해주세요.");
    }

    if (!EMAIL_ID_REGEX.test(emailId) || !EMAIL_REGEX.test(email)) {
      return showError(
        "이메일 아이디는 영문, 숫자, 특수문자(._%+-)만 사용 가능합니다."
      );
    }

    const domain = email.split("@")[1]?.toLowerCase();
    if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
      return showError("임시 이메일은 사용할 수 없습니다.");
    }

    try {
      const available = await checkEmailAvailable(email);
      if (!available) {
        setIsEmailChecked(false);
        return showError("이미 가입된 이메일입니다.");
      }
      setIsEmailChecked(true);
      showSuccess("사용 가능한 이메일입니다.");
    } catch {
      showError("이메일 확인 중 오류가 발생했습니다.");
    }
  };

  const checkNicknameDuplicate = async () => {
    if (!displayNickname) {
      nicknameRef.current?.focus();
      return Swal.fire("닉네임을 입력해주세요.");
    }

    try {
      const available = await checkNicknameAvailable(displayNickname);
      if (!available) {
        showError("이미 사용 중인 닉네임입니다.");
        setIsNicknameChecked(false);
        nicknameRef.current?.focus();
        return;
      }
      showSuccess("사용 가능한 닉네임입니다.");
      setIsNicknameChecked(true);
    } catch {
      showError("닉네임 확인 중 오류가 발생했습니다.");
    }
  };

  const handleClimbingStyleChange = (e) => {
    const { value, checked } = e.target;
    setClimbingStyle((prev) =>
      checked ? [...prev, value] : prev.filter((s) => s !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const email = getFullEmail();

    if (!EMAIL_REGEX.test(email)) {
      return showError("올바른 이메일 형식이 아닙니다.");
    }

    const domain = email.split("@")[1]?.toLowerCase();
    if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
      return showError("임시 이메일은 사용할 수 없습니다.");
    }

    if (!isAgreed) {
      return showWarning("개인정보 수집 및 이용에 동의해주세요.");
    }

    const passwordValidation = validatePasswordPair(password, confirmPassword);
    if (!passwordValidation.ok) {
      if (passwordValidation.message.includes("일치")) {
        return showError(passwordValidation.message);
      }
      return showWarning(passwordValidation.message);
    }

    if (!isEmailChecked) {
      return showWarning("이메일 중복 확인이 필요합니다.");
    }
    if (!isNicknameChecked) {
      return showWarning("닉네임 중복 확인이 필요합니다.");
    }

    setLoading(true);
    try {
      await signUp(email, password, {
        name,
        nickname: displayNickname,
        display_nickname: displayNickname,
        climbing_level: climbingLevel,
        preferred_gym: preferredGym,
        climbing_style: climbingStyle,
      });

      await Swal.fire({
        icon: "success",
        title: "가입 신청 완료!",
        text: "메일함(스팸함 포함)을 확인하여 인증을 완료해주세요.",
        background: "#1a1d29",
        color: "#fff",
        confirmButtonColor: "#5271ff",
      });
      navigate("/login");
    } catch (err) {
      let msg = "회원가입 중 오류가 발생했습니다.";
      if (err.message.includes("Database error saving new user")) {
        msg =
          "필수 정보(닉네임 등) 저장 중 오류가 발생했습니다. DB 설정을 확인해주세요.";
      } else if (err.message.includes("User already registered")) {
        msg = "이미 등록된 이메일입니다.";
      }
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    nicknameRef,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    name,
    setName,
    displayNickname,
    isAgreed,
    setIsAgreed,
    isEmailChecked,
    isNicknameChecked,
    climbingLevel,
    setClimbingLevel,
    preferredGym,
    setPreferredGym,
    climbingStyle,
    loading,
    error,
    emailId,
    emailDomain,
    emailDomains: EMAIL_DOMAINS,
    getFullEmail,
    canSubmit,
    handleNicknameChange,
    handleEmailIdChange,
    handleEmailDomainChange,
    checkEmailDuplicate,
    checkNicknameDuplicate,
    handleClimbingStyleChange,
    handleSubmit,
  };
}
