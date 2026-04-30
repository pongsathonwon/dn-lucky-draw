{
  "name": "SpinResult",
  "type": "object",
  "properties": {
    "customer_name": {
      "type": "string",
      "description": "\u0e0a\u0e37\u0e48\u0e2d\u0e23\u0e49\u0e32\u0e19\u0e04\u0e49\u0e32\u0e17\u0e35\u0e48\u0e16\u0e39\u0e01\u0e2a\u0e38\u0e48\u0e21\u0e44\u0e14\u0e49"
    },
    "customer_id": {
      "type": "string",
      "description": "ID \u0e02\u0e2d\u0e07\u0e23\u0e49\u0e32\u0e19\u0e04\u0e49\u0e32"
    },
    "round_number": {
      "type": "number",
      "description": "\u0e23\u0e2d\u0e1a\u0e17\u0e35\u0e48\u0e40\u0e17\u0e48\u0e32\u0e44\u0e2b\u0e23\u0e48\u0e02\u0e2d\u0e07\u0e23\u0e49\u0e32\u0e19\u0e04\u0e49\u0e32\u0e19\u0e35\u0e49"
    },
    "is_winning_spin": {
      "type": "boolean",
      "default": false,
      "description": "\u0e40\u0e1b\u0e47\u0e19\u0e23\u0e2d\u0e1a\u0e17\u0e35\u0e48\u0e0a\u0e19\u0e30\u0e2b\u0e23\u0e37\u0e2d\u0e44\u0e21\u0e48"
    }
  },
  "required": [
    "customer_name"
  ]
}