export const isEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);
export const  isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
