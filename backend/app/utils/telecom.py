"""Kenyan mobile network prefix detection."""

from enum import Enum


class KenyanNetwork(str, Enum):
    SAFARICOM = "safaricom"
    AIRTEL = "airtel"
    TELKOM = "telkom"
    UNKNOWN = "unknown"


_SAFARICOM_PREFIXES = {
    "25470", "25471", "25472", "25474", "25479",
    "254110", "254111", "254112", "254113", "254114", "254115", "254116",
}
_AIRTEL_PREFIXES = {"25473", "25475", "25476", "25477", "254100", "254101"}
_TELKOM_PREFIXES = {"254771", "254772"}


def detect_network(phone: str) -> KenyanNetwork:
    phone = phone.strip().replace(" ", "").replace("+", "")
    if phone.startswith("07") or phone.startswith("01"):
        phone = "254" + phone[1:]
    if not (phone.startswith("254") and len(phone) == 12 and phone.isdigit()):
        return KenyanNetwork.UNKNOWN
    prefix6, prefix5 = phone[:6], phone[:5]
    if prefix6 in _TELKOM_PREFIXES or prefix5 in _TELKOM_PREFIXES:
        return KenyanNetwork.TELKOM
    if prefix6 in _AIRTEL_PREFIXES or prefix5 in _AIRTEL_PREFIXES:
        return KenyanNetwork.AIRTEL
    if prefix6 in _SAFARICOM_PREFIXES or prefix5 in _SAFARICOM_PREFIXES:
        return KenyanNetwork.SAFARICOM
    return KenyanNetwork.UNKNOWN


def is_safaricom(phone: str) -> bool:
    return detect_network(phone) == KenyanNetwork.SAFARICOM
