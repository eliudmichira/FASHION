const ksh = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });

export function formatKsh(amount: number) {
  return `KSh ${ksh.format(amount)}`;
}
