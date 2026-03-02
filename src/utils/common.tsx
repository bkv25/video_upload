import CryptoJS from "crypto-js";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import moment from "moment";
import parse from "html-react-parser";
import React from "react";
import config from "../config";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(localeData);

type RouteItem = Record<string, unknown> & {
  path?: string;
  name?: string;
  common?: boolean;
  roleKey?: string;
  authRequired?: boolean;
  key?: string;
  icon?: string;
  routeAccess?: unknown;
  children?: unknown[];
};

const generateItems = (
  item: RouteItem,
  children?: unknown[]
): Record<string, unknown> => {
  const obj: Record<string, unknown> = {};
  if (item?.path) obj.path = item.path;
  if (item?.name) obj.name = item.name;
  if (item?.common) obj.common = item.common;
  if (item?.roleKey) obj.roleKey = item.roleKey;
  if (item?.authRequired) obj.authRequired = item.authRequired;
  if (item?.key) obj.key = item.key;
  if (item?.icon) obj.icon = item.icon;
  if (item?.routeAccess) obj.routeAccess = item.routeAccess;
  if (children) obj.children = children;
  return obj;
};

export const makeValidLink = (data: { url?: string }): string => {
  const url = data?.url ?? "";
  const link = url.search("http") < 0 ? `http://${url}` : url;
  return link;
};

export const phoneNumberField = (e: { which?: number; keyCode?: number; preventDefault: () => void }): void => {
  const ASCIICode = e.which ?? e.keyCode ?? 0;
  if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57)) {
    e.preventDefault();
  }
};

export const removeSessionStorageToken = (): void => {
  if (sessionStorage.getItem(`${config.NAME_KEY}:token`)) {
    sessionStorage.setItem(`${config.NAME_KEY}:token`, "");
  }
};

export const setSessionStorageToken = (token: string): void => {
  sessionStorage.setItem(
    `${config.NAME_KEY}:token`,
    CryptoJS.AES.encrypt(token, `${config.NAME_KEY}-token`).toString()
  );
};

export const setSessionStorage = (keyName: string, formData: unknown): void => {
  const stringData = JSON.stringify(formData);
  sessionStorage.setItem(
    `${config.NAME_KEY}:${keyName}`,
    CryptoJS.AES.encrypt(stringData, `${config.NAME_KEY}-${keyName}`).toString()
  );
};

export const getSessionStorage = (keyName: string): unknown => {
  const cipherText = sessionStorage.getItem(`${config.NAME_KEY}:${keyName}`);
  if (cipherText) {
    const bytes = CryptoJS.AES.decrypt(
      cipherText,
      `${config.NAME_KEY}-${keyName}`
    );
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
  return false;
};

export const removeSessionStorage = (keyName: string): void => {
  if (sessionStorage.getItem(`${config.NAME_KEY}:${keyName}`)) {
    sessionStorage.setItem(`${config.NAME_KEY}:${keyName}`, "");
  }
};

export const removeLocalStorageToken = (
  navigate?: (path: string) => void
): void => {
  if (localStorage.getItem(`${config.NAME_KEY}:token`)) {
    localStorage.setItem(`${config.NAME_KEY}:token`, "");
  }
  if (navigate) {
    navigate("/");
  }
};

export const getSessionStorageToken = (): string | false => {
  const ciphertext = sessionStorage.getItem(`${config.NAME_KEY}:token`);
  if (ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, `${config.NAME_KEY}-token`);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  return false;
};

export const setLocalStorage = (keyName: string, formData: unknown): void => {
  const stringData = JSON.stringify(formData);
  localStorage.setItem(
    `${config.NAME_KEY}:${keyName}`,
    CryptoJS.AES.encrypt(stringData, `${config.NAME_KEY}-${keyName}`).toString()
  );
};

export const getLocalStorage = (keyName: string): unknown => {
  const cipherText = localStorage.getItem(`${config.NAME_KEY}:${keyName}`);
  if (cipherText) {
    const bytes = CryptoJS.AES.decrypt(
      cipherText,
      `${config.NAME_KEY}-${keyName}`
    );
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
  return false;
};

export const removeLocalStorage = (keyName: string): void => {
  if (localStorage.getItem(`${config.NAME_KEY}:${keyName}`)) {
    localStorage.setItem(`${config.NAME_KEY}:${keyName}`, "");
  }
};

export const setLocalStorageToken = (token: string): void => {
  localStorage.setItem(
    `${config.NAME_KEY}:token`,
    CryptoJS.AES.encrypt(token, `${config.NAME_KEY}-token`).toString()
  );
};

export const getLocalStorageToken = (): string | false => {
  const token = localStorage.getItem(`${config.NAME_KEY}:token`);
  if (token) {
    const bytes = CryptoJS.AES.decrypt(token, `${config.NAME_KEY}-token`);
    return bytes?.toString(CryptoJS.enc.Utf8) ?? false;
  }
  return false;
};

export const getLocalStorageLanguage = (): string => {
  const language = localStorage.getItem(`${config.NAME_KEY}:language`);
  const defaultLang = (config as { DEFAULT_LANGUAGE?: string }).DEFAULT_LANGUAGE ?? "en";
  if (language) {
    return ["en", "hi"].includes(language) ? language : defaultLang;
  }
  return defaultLang;
};

export function decodeQueryData(data: string): Record<string, string> {
  return JSON.parse(
    `{"${decodeURI(data)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace("?", "")}"}`
  );
}

export const navigateWithParam = (
  data: Record<string, string>,
  navigate: (path: string) => void,
  pathname: string
): void => {
  const searchParams = new URLSearchParams(data).toString();
  navigate(`${pathname}?${searchParams}`);
};

export function getSortType(data: string): "asc" | "desc" {
  return data === "ASC" ? "asc" : "desc";
}

export const textFormatter = (data: string | null | undefined): string => {
  return data ? data.charAt(0).toUpperCase() + data.slice(1) : "-";
};

export const checkValidData = (data: unknown): string | unknown => {
  return data || "-";
};

export const htmlParser = (
  data = "",
  stripTags = false
): string | ReturnType<typeof parse> => {
  const text = data || "";
  if (stripTags) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || "";
  }
  return parse(text || "");
};

export const defaultStatusFormatter = (data: string | null | undefined): React.ReactNode => {
  return data ? (
    <>
      <span
        className={`${data}-chips chips-style rounded-pill border-1 d-flex align-items-center justify-content-center`}
      >
        {textFormatter(data)}
      </span>
    </>
  ) : (
    "-"
  );
};

export const findTextFromOptionList = (
  data: unknown,
  list?: Array<{ value?: unknown; label?: string }>
): string => {
  const value = data ? list?.find((i) => i?.value === data)?.label : "-";
  return value ?? "-";
};

export const checkValidCount = (data: unknown, isAi = false): unknown => {
  return data !== undefined && data !== null && data !== "" && Number(data) >= 0
    ? data
    : isAi
      ? "-"
      : 0;
};

export const nameFormatter = (
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string => {
  const data = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return data || "-";
};

type AddressData = {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pin?: string;
};

export const addressFormatter = (data: AddressData | null | undefined): string => {
  return data?.address
    ? `${data?.address ? data.address + ", " : ""} ${
        data?.city ? data.city + ", " : ""
      } ${data?.state ? data.state + ", " : ""} ${
        data?.country ? data.country + ", " : ""
      } ${data?.pin ?? ""}`.trim()
    : "-";
};

// export const statusFormatter = (data) => {
//   let statusObj = {
//     "in-service": "In Service",
//     available: "Available",
//     draft: "Draft",
//     rejected: "Rejected",
//     created: "Requested",
//     completed: "Completed",
//     "in-progress": "In Progress",
//     accepted: "Accepted",
//     pending: "Pending",
//     "admin-updated": "Admin updated",
//     overdue: "Overdue",
//     sent: "Sent",
//     paid: "Paid",
//     "de-fleet": "De Fleeted",
//   };

//   let obj = {
//     success: ["available", "completed", "accepted", "admin-updated", "paid"],
//     warning: ["created", "in-progress", "pending", "sent"],
//     danger: ["in-service", "rejected", "overdue", "de-fleet"],
//     secondary: ["draft"],
//   };

//   let key;
//   Object.keys(obj).forEach((item) => {
//     if (obj[item].includes(data)) {
//       key = item;
//     }
//   });

//   return (
//     <>
//       <CustomBadge
//         className={"py-2 px-3 font-normal custom-badge"}
//         text={statusObj[data]}
//         bg={key}
//       />
//     </>
//   );
// };

export const iconNameFormatter = (
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string => {
  let name = "";
  if (firstName) name += firstName.charAt(0).toUpperCase();
  if (lastName) name += lastName.charAt(0).toUpperCase();
  return name;
};

// export const userInfoFormatter = (data, isIconVisible = true) => {
//   return (
//     <div className="user-card">
//       {isIconVisible && (
//         <div className="user-avatar bg-primary">
//           {data?.user_avatar ? (
//             <>
//               <ImageElement previewSource={data?.user_avatar} />
//             </>
//           ) : (
//             <>
//               <span>{iconNameFormatter(data?.user_name || data?.name)}</span>
//             </>
//           )}
//         </div>
//       )}
//       <div className="user-info">
//         <span className="tb-lead">
//           {nameFormatter(data?.user_name || data?.name)}{" "}
//         </span>
//         <span>{checkValidData(data?.email)}</span>
//       </div>
//     </div>
//   );
// };

export const momentFormatter = (date: unknown, format?: string): moment.Moment => {
  return moment(date as string, format);
};

export const momentDateFormatter = (date: unknown, format: string): string => {
  return moment(date as string).format(format);
};

export const dayJsFormatter = (date: unknown, format?: string): dayjs.Dayjs => {
  return dayjs(date as string, format);
};

export function convertUnixTimestampToDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const dateFormatter = (
  date: unknown,
  format: string,
  isEmpty = false
): string => {
  return date != null && date !== ""
    ? dayjs(date as string | number | Date).format(format)
    : isEmpty
      ? ""
      : "-";
};

export const timeFormatter = (
  time: unknown,
  format = "HH:mm",
  isEmpty = false
): string => {
  return time ? dayjs(time as string, "HH:mm:ss").format(format) : isEmpty ? "" : "-";
};

export const durationFormatter = (data: number): React.ReactElement => {
  const date = Math.abs(data);
  const days = Math.floor(date / 24);
  const hours = date - days * 24;
  return (
    <span className={data > 0 ? "text-success" : "text-danger"}>
      {days > 0 && (days === 1 ? `${days} day` : `${days} days`)}{" "}
      {hours > 0 && (hours === 1 ? `${hours} hour` : `${hours} hours`)}{" "}
      {data > 0 ? "left" : "exceed"}
    </span>
  );
};

export const getMonthsList = (isShort = false): string[] => {
  return isShort ? dayjs.monthsShort() : dayjs.months();
};

export const getWeekList = (): string[] => {
  return dayjs.weekdays();
};

export const getPastFiveYears = (numbers = 1): string[] => {
  const arr: string[] = [];
  [...new Array(numbers)].forEach((_, key) => {
    arr.push(dayjs(new Date()).subtract(key, "year").format("YYYY"));
  });
  return arr;
};

type DayjsDiffUnit = "day" | "week" | "month" | "year" | "hour" | "minute" | "second" | "millisecond" | "hours" | "minutes" | "seconds" | "days" | "weeks" | "months" | "years";

export const dateDifference = (
  startDate: unknown,
  endDate: Date | unknown = new Date(),
  type: DayjsDiffUnit = "hours"
): number | undefined => {
  const date1 = dayjs(startDate as string | number | Date);
  const date2 = dayjs(endDate as string | number | Date).add(1, "day");
  const diff = date2.diff(date1, type);
  return endDate != null && startDate != null ? diff : undefined;
};

// export const actionDropdown = (row, items) => {
//   return (
//     <>
//       <BootstrapDropdown
//         toggleIcon={<em className="icon ni ni-more-h" />}
//         dropdownClassName="drodown"
//         toggleClassName="btn btn-icon btn-trigger "
//         dropdownMenu={items}
//         data={row}
//       />
//     </>
//   );
// };

// export const imageFormatter = (data, type) => {
//   return data ? (
//     <ImageElement
//       previewSource={data}
//       width="80px"
//       className="table-image"
//       type={type}
//       // height="80px"
//       alt="device"
//     />
//   ) : (
//     "-"
//   );
// };

export const onlyNumberFields = (e: { which?: number; keyCode?: number; preventDefault: () => void }): void => {
  const ASCIICode = e.which ?? e.keyCode ?? 0;
  if (
    (ASCIICode > 31 && ASCIICode < 48) ||
    (ASCIICode > 57 && ASCIICode !== 189)
  ) {
    e.preventDefault();
  }
};

export const disabledPastDate = (current: dayjs.Dayjs | null): boolean => {
  return !!(current && current < dayjs().subtract(1, "day").endOf("day"));
};

export const disabledFutureDate = (current: dayjs.Dayjs | null): boolean => {
  return !!(current && current > dayjs().endOf("day"));
};

export const getFirstDate = () => {
  return dayjs().startOf("year");
};

// export function getDisabledDate(type, compareDate) {
//   return function (current) {
//     const today = dayjs().startOf("day");

//     if (current.isBefore(today)) return true;

//     if (type === "start" && compareDate) {
//       return current.isAfter(compareDate, "day");
//     }

//     if (type === "end" && compareDate) {
//       return current.isBefore(compareDate, "day");
//     }

//     return false;
//   };
// }

type DayjsLike = string | number | Date | dayjs.Dayjs;

export function getDisabledDate(
  type: string,
  compareDate: unknown,
  startDate: unknown,
  endDate: unknown,
  isBeforeDisable = true
): (current: dayjs.Dayjs) => boolean {
  return function (current: dayjs.Dayjs): boolean {
    const today = dayjs().startOf("day");

    if (isBeforeDisable) {
      if (current.isBefore(today)) return true;
    }

    if (startDate && endDate) {
      if (
        current.isBefore(dayjs(startDate as DayjsLike), "day") ||
        current.isAfter(dayjs(endDate as DayjsLike), "day")
      ) {
        return true;
      }
    } else if (startDate && !endDate) {
      if (current.isBefore(dayjs(startDate as DayjsLike), "day")) {
        return true;
      }
    } else if (!startDate && endDate) {
      if (current.isAfter(dayjs(endDate as DayjsLike), "day")) {
        return true;
      }
    }

    if (type === "start" && compareDate != null) {
      return current.isAfter(compareDate as DayjsLike, "day");
    }

    if (type === "end" && compareDate != null) {
      return current.isBefore(compareDate as DayjsLike, "day");
    }

    return false;
  };
}

export function getSeasonDisabledDate(
  type: string,
  compareDate: unknown
): (current: dayjs.Dayjs | null) => boolean {
  return function (current: dayjs.Dayjs | null): boolean {
    if (!current) return false;

    const startOfYear = dayjs().startOf("year");

    if (current.isBefore(startOfYear, "day")) return true;

    if (type === "start" && compareDate != null) {
      return current.isAfter(compareDate as DayjsLike, "day");
    }

    if (type === "end" && compareDate != null) {
      return current.isBefore(compareDate as DayjsLike, "day");
    }

    return false;
  };
}

export const disabledDOBDate = (current: dayjs.Dayjs | null): boolean => {
  return !!(current && current > dayjs().subtract(18, "years").endOf("day"));
};

export const dayJSSubtractDate = (data: number, value: dayjs.ManipulateType): dayjs.Dayjs => {
  return dayjs().subtract(data, value);
};

export const dayJSAddDate = (
  data: number,
  value: dayjs.ManipulateType,
  date: Date | string = new Date()
): dayjs.Dayjs => {
  return dayjs(date).add(data, value);
};

// export const defaultRedirectPath = (data) => {

// }

export const getMenu = (
  data: RouteItem[] | undefined,
  key: string
): Record<string, unknown>[] => {
  let arr: Record<string, unknown>[] = [];
  if ((data?.length ?? 0) > 0) {
    const headerData = (list: RouteItem[]): void => {
      const childArr: Record<string, unknown>[] = [];
      const childData = (childList: RouteItem[]): Record<string, unknown>[] => {
        const childListArr: Record<string, unknown>[] = [];
        childList.forEach((element) => {
          if (element?.[key]) {
            if (element?.children && (element.children as RouteItem[]).length > 0) {
              const children = childData(element.children as RouteItem[]);
              childListArr.push(generateItems(element, children));
            } else {
              childListArr.push(generateItems(element));
            }
          }
        });
        return childListArr;
      };
      list.forEach((element) => {
        if (element?.[key]) {
          if (element?.children && (element.children as RouteItem[]).length > 0) {
            const children = childData(element.children as RouteItem[]);
            childArr.push(generateItems(element, children));
          } else {
            childArr.push(generateItems(element));
          }
        }
      });
      arr = [...childArr];
    };
    if (data) headerData(data);
  }
  return arr;
};

export function otpRegex(): RegExp {
  return /^[0-9]+$/;
}

export const readMoreButton = (
  data: string | null | undefined | false,
  _showMoreText: (text: string) => void,
  limit = 50
): React.ReactNode => {
  if ([undefined, null, false].includes(data as undefined | null | false)) {
    return <></>;
  }
  const str = String(data ?? "");
  if (str.length < limit) {
    return <>{str}</>;
  }
  return <p>{str.substring(0, limit)}...</p>;
};

export const serialNumberFormatter = (
  page: number,
  pageSize: number,
  index: number
): React.ReactElement => {
  return <>{((page - 1) * pageSize + (index + 1))}</>;
};

export function getFileType(filename: string): string {
  const parts = filename.split(".");
  if (parts.length > 1) {
    return parts.pop() ?? "";
  }
  return "";
}

type UrlType = "image" | "ppt" | "zip";

export const checkUrl = (
  data: string[] | null | undefined,
  type: UrlType
): string | undefined => {
  const obj: Record<UrlType, string[]> = {
    image: ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"],
    ppt: ["pptx", "ppt"],
    zip: ["zip"],
  };
  let val: string | undefined;
  data?.forEach((element) => {
    if (obj[type]?.includes(element.split(".").pop() ?? "")) {
      val = element;
    }
  });
  return val ?? data?.[2];
};

export const onPreview = async (file: string | { url?: string } | File): Promise<void> => {
  if (typeof file === "string") {
    window.open(file);
  } else if (file instanceof File) {
    const src = URL.createObjectURL(file);
    window.open(src);
  } else {
    const src = file.url;
    if (src) window.open(src);
  }
};

export function formatDecimal(value: number | string): string {
  const floatValue = parseFloat(String(value));

  if (floatValue % 1 === 0) {
    return floatValue.toFixed(0);
  }

  return floatValue.toFixed(2);
}

export const downloadFile = (path: string, name: string): void => {
  setTimeout(() => {
    const link = document.createElement("a");
    link.href = path;
    link.download = name;
    link.click();
  }, 1000);
};

export const downloadFileFromUrl = async (url: string, fileName: string): Promise<void> => {
  if (!url || !fileName) return;

  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(blobUrl);
};

export const getUniqueList = <T extends Record<string, unknown>>(
  arr: T[],
  key: keyof T
): T[] => {
  return [...new Map(arr.map((item) => [item[key], item])).values()];
};

export const priceFormater = (data: unknown): string => {
  return data != null ? `$ ${Number(data).toFixed(2)}` : `$ 0`;
};

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
};

export const roleFormatter = (role: string): string => {
  return roleLabels[role] ?? textFormatter(role);
};

// export const convertNumber = (data) => {
//   return data !== undefined ? Number(data) : 0;
// };

export function convertNumber(
  value: string | number | null | undefined
): number | bigint | null {
  if (value === null || value === undefined || value === "") return null;
  const strValue = String(value).trim();
  if (!/^-?\d+(\.\d+)?$/.test(strValue)) return null;
  const num = Number(strValue);
  if (strValue.includes(".") || Math.abs(num) <= Number.MAX_SAFE_INTEGER) {
    return num;
  }
  try {
    return BigInt(strValue);
  } catch {
    return null;
  }
}

type Crop = { x: number; y: number; width: number; height: number };

export const getCroppedImg = (
  imageSrc: string,
  crop: Crop,
  fileObj: { name?: string; type?: string }
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas 2d context not available"));
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Canvas is empty"));
        const file = new File([blob], fileObj?.name ?? "cropped", {
          type: fileObj?.type,
        });
        resolve(file);
      }, fileObj?.type);
    };
    image.onerror = reject;
  });
};

export function changeFile(file: Blob | null | undefined): string | undefined {
  if (file) {
    const blob = new Blob([file], { type: file.type });
    return URL.createObjectURL(blob);
  }
}

export const getIn = (obj: unknown, path: string): unknown => {
  return path.split(".").reduce((acc: unknown, part: string) => (acc as Record<string, unknown>)?.[part], obj);
};

const getValueByPath = (obj: unknown, path: string): unknown => {
  return path.split(".").reduce((acc: unknown, key: string) => {
    const next = (acc as Record<string, unknown>)?.[key];
    if (next !== undefined && next !== null) return next;
    return "";
  }, obj);
};

type SchemaField = { name: string; key: string; formatter?: (v: unknown) => unknown };

export const formatExportData = (
  schema: Record<string, SchemaField>,
  data: Record<string, unknown>[]
): Record<string, unknown>[] => {
  const schemaKeys = Object.keys(schema);
  return data.map((row) => {
    const formattedRow: Record<string, unknown> = {};
    schemaKeys.forEach((fieldKey) => {
      const { name, key, formatter } = schema[fieldKey];
      formattedRow[name] = formatter
        ? formatter(getValueByPath(row, key))
        : getValueByPath(row, key);
    });
    return formattedRow;
  });
};

export const toBase64 = (url: string): Promise<string | ArrayBuffer | null> =>
  fetch(url)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );

export const svgToPngBase64 = (
  svgUrl: string,
  renderWidth = 800,
  renderHeight = 400
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = svgUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = renderWidth;
      canvas.height = renderHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas 2d context"));
        return;
      }
      ctx.drawImage(img, 0, 0, renderWidth, renderHeight);
      resolve(canvas.toDataURL("image/png", 1.0));
    };
    img.onerror = reject;
  });
};

export const imageToBase64 = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width || 200;
        canvas.height = img.height || 60;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas 2d context"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
};

export function chunkArray<T>(arr: T[], size = 6): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const settings: { defaultCurrency?: string } = {};

export function getDefaultCurrency<T extends { label?: string }>(
  list: T[] | null | undefined
): T | undefined {
  return list?.find((i) => i?.label?.toLowerCase() === settings?.defaultCurrency);
}

export function appendResponseData(data: {
  id?: unknown;
  created_by?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
  updated_by?: unknown;
}): Record<string, unknown> {
  return data?.id
    ? {
        id: data.id,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        updated_by: data.updated_by,
      }
    : {};
}
