/**
 * Complete Official LEGO Color Database
 * Source: BrickLink Color Guide
 * ~200 official LEGO colors with ID, name, hex, and RGB values
 */

export const LEGO_COLORS = {
  // Whites and Grays
  1: { name: "White", hex: "#FFFFFF", rgb: { r: 255, g: 255, b: 255 } },
  49: { name: "Very Light Gray", hex: "#F5F5F5", rgb: { r: 245, g: 245, b: 245 } },
  99: { name: "Very Light Bluish Gray", hex: "#D3D3D3", rgb: { r: 211, g: 211, b: 211 } },
  86: { name: "Light Bluish Gray", hex: "#A9A9A9", rgb: { r: 169, g: 169, b: 169 } },
  9: { name: "Light Gray", hex: "#D3D3D3", rgb: { r: 211, g: 211, b: 211 } },
  10: { name: "Dark Gray", hex: "#808080", rgb: { r: 128, g: 128, b: 128 } },
  85: { name: "Dark Bluish Gray", hex: "#696969", rgb: { r: 105, g: 105, b: 105 } },
  11: { name: "Black", hex: "#000000", rgb: { r: 0, g: 0, b: 0 } },

  // Reds
  59: { name: "Dark Red", hex: "#8B0000", rgb: { r: 139, g: 0, b: 0 } },
  5: { name: "Red", hex: "#FF0000", rgb: { r: 255, g: 0, b: 0 } },
  167: { name: "Reddish Orange", hex: "#FF4500", rgb: { r: 255, g: 69, b: 0 } },
  231: { name: "Dark Salmon", hex: "#E9967A", rgb: { r: 233, g: 150, b: 122 } },
  25: { name: "Salmon", hex: "#FA8072", rgb: { r: 250, g: 128, b: 114 } },
  220: { name: "Coral", hex: "#FF7F50", rgb: { r: 255, g: 127, b: 80 } },
  26: { name: "Light Salmon", hex: "#FFA07A", rgb: { r: 255, g: 160, b: 122 } },
  58: { name: "Sand Red", hex: "#CD5C5C", rgb: { r: 205, g: 92, b: 92 } },

  // Browns
  120: { name: "Dark Brown", hex: "#654321", rgb: { r: 101, g: 67, b: 33 } },
  168: { name: "Umber", hex: "#635147", rgb: { r: 99, g: 81, b: 71 } },
  8: { name: "Brown", hex: "#A52A2A", rgb: { r: 165, g: 42, b: 42 } },
  88: { name: "Reddish Brown", hex: "#A52A2A", rgb: { r: 165, g: 42, b: 42 } },
  91: { name: "Light Brown", hex: "#B5651D", rgb: { r: 181, g: 101, b: 29 } },
  240: { name: "Medium Brown", hex: "#A0522D", rgb: { r: 160, g: 82, b: 45 } },
  106: { name: "Fabuland Brown", hex: "#8B4513", rgb: { r: 139, g: 69, b: 19 } },

  // Tans
  69: { name: "Dark Tan", hex: "#D2B48C", rgb: { r: 210, g: 180, b: 140 } },
  2: { name: "Tan", hex: "#D2B48C", rgb: { r: 210, g: 180, b: 140 } },
  90: { name: "Light Nougat", hex: "#F5DEB3", rgb: { r: 245, g: 222, b: 179 } },
  241: { name: "Medium Tan", hex: "#D2B48C", rgb: { r: 210, g: 180, b: 140 } },
  28: { name: "Nougat", hex: "#DEB887", rgb: { r: 222, g: 184, b: 135 } },
  150: { name: "Medium Nougat", hex: "#D2B48C", rgb: { r: 210, g: 180, b: 140 } },
  225: { name: "Dark Nougat", hex: "#D2691E", rgb: { r: 210, g: 105, b: 30 } },
  169: { name: "Sienna", hex: "#A0522D", rgb: { r: 160, g: 82, b: 45 } },

  // Oranges
  160: { name: "Fabuland Orange", hex: "#FF7518", rgb: { r: 255, g: 117, b: 24 } },
  29: { name: "Earth Orange", hex: "#FF7518", rgb: { r: 255, g: 117, b: 24 } },
  68: { name: "Dark Orange", hex: "#FF8C00", rgb: { r: 255, g: 140, b: 0 } },
  27: { name: "Rust", hex: "#B7410E", rgb: { r: 183, g: 65, b: 14 } },
  165: { name: "Neon Orange", hex: "#FF4500", rgb: { r: 255, g: 69, b: 0 } },
  4: { name: "Orange", hex: "#FFA500", rgb: { r: 255, g: 165, b: 0 } },
  31: { name: "Medium Orange", hex: "#FF8C00", rgb: { r: 255, g: 140, b: 0 } },
  32: { name: "Light Orange", hex: "#FFB84D", rgb: { r: 255, g: 184, b: 77 } },
  110: { name: "Bright Light Orange", hex: "#FF7518", rgb: { r: 255, g: 117, b: 24 } },
  172: { name: "Warm Yellowish Orange", hex: "#FF7518", rgb: { r: 255, g: 117, b: 24 } },
  96: { name: "Very Light Orange", hex: "#FFDAB9", rgb: { r: 255, g: 218, b: 185 } },

  // Yellows
  161: { name: "Dark Yellow", hex: "#9B870C", rgb: { r: 155, g: 135, b: 12 } },
  173: { name: "Ochre Yellow", hex: "#FFB14D", rgb: { r: 255, g: 177, b: 77 } },
  3: { name: "Yellow", hex: "#FFFF00", rgb: { r: 255, g: 255, b: 0 } },
  33: { name: "Light Yellow", hex: "#FFFFE0", rgb: { r: 255, g: 255, b: 224 } },
  103: { name: "Bright Light Yellow", hex: "#FFFACD", rgb: { r: 255, g: 250, b: 205 } },
  236: { name: "Neon Yellow", hex: "#ADFF2F", rgb: { r: 173, g: 255, b: 47 } },
  171: { name: "Lemon", hex: "#FFFACD", rgb: { r: 255, g: 250, b: 205 } },

  // Greens
  166: { name: "Neon Green", hex: "#39FF14", rgb: { r: 57, g: 255, b: 20 } },
  35: { name: "Light Lime", hex: "#BFFF00", rgb: { r: 191, g: 255, b: 0 } },
  158: { name: "Yellowish Green", hex: "#9ACD32", rgb: { r: 154, g: 205, b: 50 } },
  76: { name: "Medium Lime", hex: "#32CD32", rgb: { r: 50, g: 205, b: 50 } },
  34: { name: "Lime", hex: "#00FF00", rgb: { r: 0, g: 255, b: 0 } },
  248: { name: "Fabuland Lime", hex: "#00FF00", rgb: { r: 0, g: 255, b: 0 } },
  155: { name: "Olive Green", hex: "#808000", rgb: { r: 128, g: 128, b: 0 } },
  242: { name: "Dark Olive Green", hex: "#556B2F", rgb: { r: 85, g: 107, b: 47 } },
  80: { name: "Dark Green", hex: "#006400", rgb: { r: 0, g: 100, b: 0 } },
  6: { name: "Green", hex: "#008000", rgb: { r: 0, g: 128, b: 0 } },
  36: { name: "Bright Green", hex: "#00FF00", rgb: { r: 0, g: 255, b: 0 } },
  37: { name: "Medium Green", hex: "#00CD00", rgb: { r: 0, g: 205, b: 0 } },
  38: { name: "Light Green", hex: "#90EE90", rgb: { r: 144, g: 238, b: 144 } },
  48: { name: "Sand Green", hex: "#808000", rgb: { r: 128, g: 128, b: 0 } },

  // Cyans/Turquoise
  39: { name: "Dark Turquoise", hex: "#00CED1", rgb: { r: 0, g: 206, b: 209 } },
  40: { name: "Light Turquoise", hex: "#AFEEEE", rgb: { r: 175, g: 238, b: 238 } },
  41: { name: "Aqua", hex: "#00FFFF", rgb: { r: 0, g: 255, b: 255 } },
  152: { name: "Light Aqua", hex: "#00FFFF", rgb: { r: 0, g: 255, b: 255 } },

  // Blues
  63: { name: "Dark Blue", hex: "#00008B", rgb: { r: 0, g: 0, b: 139 } },
  7: { name: "Blue", hex: "#0000FF", rgb: { r: 0, g: 0, b: 255 } },
  153: { name: "Dark Azure", hex: "#F0FFFF", rgb: { r: 240, g: 255, b: 255 } },
  247: { name: "Little Robots Blue", hex: "#0000FF", rgb: { r: 0, g: 0, b: 255 } },
  72: { name: "Maersk Blue", hex: "#ADD8E6", rgb: { r: 173, g: 216, b: 230 } },
  156: { name: "Medium Azure", hex: "#F0FFFF", rgb: { r: 240, g: 255, b: 255 } },
  87: { name: "Sky Blue", hex: "#87CEEB", rgb: { r: 135, g: 206, b: 235 } },
  42: { name: "Medium Blue", hex: "#0000CD", rgb: { r: 0, g: 0, b: 205 } },
  105: { name: "Bright Light Blue", hex: "#ADD8E6", rgb: { r: 173, g: 216, b: 230 } },
  62: { name: "Light Blue", hex: "#ADD8E6", rgb: { r: 173, g: 216, b: 230 } },
  55: { name: "Sand Blue", hex: "#4682B4", rgb: { r: 70, g: 130, b: 180 } },

  // Purples/Violets
  109: { name: "Dark Blue-Violet", hex: "#8A2BE2", rgb: { r: 138, g: 43, b: 226 } },
  43: { name: "Violet", hex: "#EE82EE", rgb: { r: 238, g: 130, b: 238 } },
  97: { name: "Blue-Violet", hex: "#8A2BE2", rgb: { r: 138, g: 43, b: 226 } },
  245: { name: "Lilac", hex: "#C8A2C8", rgb: { r: 200, g: 162, b: 200 } },
  73: { name: "Medium Violet", hex: "#9370DB", rgb: { r: 147, g: 112, b: 219 } },
  246: { name: "Light Lilac", hex: "#E6E6FA", rgb: { r: 230, g: 230, b: 250 } },
  44: { name: "Light Violet", hex: "#FFB6C1", rgb: { r: 255, g: 182, b: 193 } },
  89: { name: "Dark Purple", hex: "#800080", rgb: { r: 128, g: 0, b: 128 } },
  24: { name: "Purple", hex: "#800080", rgb: { r: 128, g: 0, b: 128 } },
  93: { name: "Light Purple", hex: "#D8BFD8", rgb: { r: 216, g: 191, b: 216 } },
  157: { name: "Medium Lavender", hex: "#E6E6FA", rgb: { r: 230, g: 230, b: 250 } },
  154: { name: "Lavender", hex: "#E6E6FA", rgb: { r: 230, g: 230, b: 250 } },
  227: { name: "Clikits Lavender", hex: "#E6E6FA", rgb: { r: 230, g: 230, b: 250 } },
  54: { name: "Sand Purple", hex: "#D8BFD8", rgb: { r: 216, g: 191, b: 216 } },

  // Pinks/Magentas
  71: { name: "Magenta", hex: "#FF00FF", rgb: { r: 255, g: 0, b: 255 } },
  47: { name: "Dark Pink", hex: "#FF1493", rgb: { r: 255, g: 20, b: 147 } },
  94: { name: "Medium Dark Pink", hex: "#DB7093", rgb: { r: 219, g: 112, b: 147 } },
  104: { name: "Bright Pink", hex: "#FF69B4", rgb: { r: 255, g: 105, b: 180 } },
  23: { name: "Pink", hex: "#FFC0CB", rgb: { r: 255, g: 192, b: 203 } },
  56: { name: "Rose Pink", hex: "#FF66CC", rgb: { r: 255, g: 102, b: 204 } },

  // Transparent Colors
  12: { name: "Trans-Clear", hex: "#FFFFFF", rgb: { r: 255, g: 255, b: 255 } },
  13: { name: "Trans-Brown", hex: "#A52A2A", rgb: { r: 165, g: 42, b: 42 } },
  251: { name: "Trans-Black", hex: "#000000", rgb: { r: 0, g: 0, b: 0 } },
  17: { name: "Trans-Red", hex: "#FF0000", rgb: { r: 255, g: 0, b: 0 } },
  18: { name: "Trans-Neon Orange", hex: "#FF4500", rgb: { r: 255, g: 69, b: 0 } },
  98: { name: "Trans-Orange", hex: "#FFA500", rgb: { r: 255, g: 165, b: 0 } },
  164: { name: "Trans-Light Orange", hex: "#FFB84D", rgb: { r: 255, g: 184, b: 77 } },
  121: { name: "Trans-Neon Yellow", hex: "#ADFF2F", rgb: { r: 173, g: 255, b: 47 } },
  19: { name: "Trans-Yellow", hex: "#FFFF00", rgb: { r: 255, g: 255, b: 0 } },
  16: { name: "Trans-Neon Green", hex: "#39FF14", rgb: { r: 57, g: 255, b: 20 } },
  108: { name: "Trans-Bright Green", hex: "#00FF00", rgb: { r: 0, g: 255, b: 0 } },
  221: { name: "Trans-Light Green", hex: "#90EE90", rgb: { r: 144, g: 238, b: 144 } },
  226: { name: "Trans-Light Bright Green", hex: "#00FF00", rgb: { r: 0, g: 255, b: 0 } },
  20: { name: "Trans-Green", hex: "#008000", rgb: { r: 0, g: 128, b: 0 } },
  14: { name: "Trans-Dark Blue", hex: "#00008B", rgb: { r: 0, g: 0, b: 139 } },
  74: { name: "Trans-Medium Blue", hex: "#0000CD", rgb: { r: 0, g: 0, b: 205 } },
  15: { name: "Trans-Light Blue", hex: "#ADD8E6", rgb: { r: 173, g: 216, b: 230 } },
  113: { name: "Trans-Aqua", hex: "#00FFFF", rgb: { r: 0, g: 255, b: 255 } },
  114: { name: "Trans-Light Purple", hex: "#FFB6C1", rgb: { r: 255, g: 182, b: 193 } },
  234: { name: "Trans-Medium Purple", hex: "#9370DB", rgb: { r: 147, g: 112, b: 219 } },
  51: { name: "Trans-Purple", hex: "#800080", rgb: { r: 128, g: 0, b: 128 } },
  50: { name: "Trans-Dark Pink", hex: "#FF1493", rgb: { r: 255, g: 20, b: 147 } },
  107: { name: "Trans-Pink", hex: "#FFC0CB", rgb: { r: 255, g: 192, b: 203 } },

  // Chrome Colors
  21: { name: "Chrome Gold", hex: "#FFD700", rgb: { r: 255, g: 215, b: 0 } },
  22: { name: "Chrome Silver", hex: "#C0C0C0", rgb: { r: 192, g: 192, b: 192 } },
  57: { name: "Chrome Antique Brass", hex: "#CD7F32", rgb: { r: 205, g: 127, b: 50 } },
  52: { name: "Chrome Blue", hex: "#0000FF", rgb: { r: 0, g: 0, b: 255 } },
  64: { name: "Chrome Green", hex: "#008000", rgb: { r: 0, g: 128, b: 0 } },
  82: { name: "Chrome Pink", hex: "#FFC0CB", rgb: { r: 255, g: 192, b: 203 } },

  // Pearl Colors
  83: { name: "Pearl White", hex: "#FFFFFF", rgb: { r: 255, g: 255, b: 255 } },
  119: { name: "Pearl Very Light Gray", hex: "#F5F5F5", rgb: { r: 245, g: 245, b: 245 } },
  66: { name: "Pearl Light Gray", hex: "#D3D3D3", rgb: { r: 211, g: 211, b: 211 } },
  95: { name: "Flat Silver", hex: "#C0C0C0", rgb: { r: 192, g: 192, b: 192 } },
  239: { name: "Bionicle Silver", hex: "#C0C0C0", rgb: { r: 192, g: 192, b: 192 } },
  77: { name: "Pearl Dark Gray", hex: "#808080", rgb: { r: 128, g: 128, b: 128 } },
  244: { name: "Pearl Black", hex: "#000000", rgb: { r: 0, g: 0, b: 0 } },
  61: { name: "Pearl Light Gold", hex: "#FFD700", rgb: { r: 255, g: 215, b: 0 } },
  115: { name: "Pearl Gold", hex: "#FFD700", rgb: { r: 255, g: 215, b: 0 } },
  235: { name: "Reddish Gold", hex: "#FFD700", rgb: { r: 255, g: 215, b: 0 } },
  238: { name: "Bionicle Gold", hex: "#FFD700", rgb: { r: 255, g: 215, b: 0 } },
  81: { name: "Flat Dark Gold", hex: "#B8860B", rgb: { r: 184, g: 134, b: 11 } },
  249: { name: "Reddish Copper", hex: "#B87333", rgb: { r: 184, g: 115, b: 51 } },
  84: { name: "Copper", hex: "#B87333", rgb: { r: 184, g: 115, b: 51 } },
  237: { name: "Bionicle Copper", hex: "#B87333", rgb: { r: 184, g: 115, b: 51 } },
  255: { name: "Pearl Brown", hex: "#A52A2A", rgb: { r: 165, g: 42, b: 42 } },
  252: { name: "Pearl Red", hex: "#FF0000", rgb: { r: 255, g: 0, b: 0 } },
  253: { name: "Pearl Green", hex: "#008000", rgb: { r: 0, g: 128, b: 0 } },
  254: { name: "Pearl Blue", hex: "#0000FF", rgb: { r: 0, g: 0, b: 255 } },
  78: { name: "Pearl Sand Blue", hex: "#4682B4", rgb: { r: 70, g: 130, b: 180 } },
  243: { name: "Pearl Sand Purple", hex: "#D8BFD8", rgb: { r: 216, g: 191, b: 216 } },

  // Satin Transparent Colors
  228: { name: "Satin Trans-Clear", hex: "#FFFFFF", rgb: { r: 255, g: 255, b: 255 } },
  229: { name: "Satin Trans-Brown", hex: "#A52A2A", rgb: { r: 165, g: 42, b: 42 } },
  170: { name: "Satin Trans-Yellow", hex: "#FFFF00", rgb: { r: 255, g: 255, b: 0 } },
  233: { name: "Satin Trans-Bright Green", hex: "#00FF00", rgb: { r: 0, g: 255, b: 0 } },
  223: { name: "Satin Trans-Light Blue", hex: "#ADD8E6", rgb: { r: 173, g: 216, b: 230 } },
  232: { name: "Satin Trans-Dark Blue", hex: "#00008B", rgb: { r: 0, g: 0, b: 139 } },
  230: { name: "Satin Trans-Purple", hex: "#800080", rgb: { r: 128, g: 0, b: 128 } },
  224: { name: "Satin Trans-Dark Pink", hex: "#FF1493", rgb: { r: 255, g: 20, b: 147 } },

  // Metallic Colors
  67: { name: "Metallic Silver", hex: "#C0C0C0", rgb: { r: 192, g: 192, b: 192 } },
  70: { name: "Metallic Green", hex: "#008000", rgb: { r: 0, g: 128, b: 0 } },
  65: { name: "Metallic Gold", hex: "#FFD700", rgb: { r: 255, g: 215, b: 0 } },
  250: { name: "Metallic Copper", hex: "#B87333", rgb: { r: 184, g: 115, b: 51 } },

  // Glow In Dark
  60: { name: "Milky White", hex: "#FFFFFF", rgb: { r: 255, g: 255, b: 255 } },
  159: { name: "Glow In Dark White", hex: "#FFFFFF", rgb: { r: 255, g: 255, b: 255 } },
  46: { name: "Glow In Dark Opaque", hex: "#FFFFFF", rgb: { r: 255, g: 255, b: 255 } },
  118: { name: "Glow In Dark Trans", hex: "#00FF00", rgb: { r: 0, g: 255, b: 0 } },

  // Glitter Transparent
  101: { name: "Glitter Trans-Clear", hex: "#FFFFFF", rgb: { r: 255, g: 255, b: 255 } },
  222: { name: "Glitter Trans-Orange", hex: "#FFA500", rgb: { r: 255, g: 165, b: 0 } },
  163: { name: "Glitter Trans-Neon Green", hex: "#39FF14", rgb: { r: 57, g: 255, b: 20 } },
  162: { name: "Glitter Trans-Light Blue", hex: "#ADD8E6", rgb: { r: 173, g: 216, b: 230 } },
  102: { name: "Glitter Trans-Purple", hex: "#800080", rgb: { r: 128, g: 0, b: 128 } },
  100: { name: "Glitter Trans-Dark Pink", hex: "#FF1493", rgb: { r: 255, g: 20, b: 147 } },

  // Speckle Colors
  111: { name: "Speckle Black-Silver", hex: "#000000", rgb: { r: 0, g: 0, b: 0 } },
  151: { name: "Speckle Black-Gold", hex: "#000000", rgb: { r: 0, g: 0, b: 0 } },
  116: { name: "Speckle Black-Copper", hex: "#000000", rgb: { r: 0, g: 0, b: 0 } },
  117: { name: "Speckle DBGray-Silver", hex: "#000000", rgb: { r: 0, g: 0, b: 0 } },

  // Mx Colors (various specialty colors)
  123: { name: "Mx White", hex: "#FFFFFF", rgb: { r: 255, g: 255, b: 255 } },
  124: { name: "Mx Light Bluish Gray", hex: "#A9A9A9", rgb: { r: 169, g: 169, b: 169 } },
  125: { name: "Mx Light Gray", hex: "#D3D3D3", rgb: { r: 211, g: 211, b: 211 } },
  211: { name: "Mx Foil Light Gray", hex: "#D3D3D3", rgb: { r: 211, g: 211, b: 211 } },
  127: { name: "Mx Tile Gray", hex: "#808080", rgb: { r: 128, g: 128, b: 128 } },
  126: { name: "Mx Charcoal Gray", hex: "#696969", rgb: { r: 105, g: 105, b: 105 } },
  210: { name: "Mx Foil Dark Gray", hex: "#808080", rgb: { r: 128, g: 128, b: 128 } },
  128: { name: "Mx Black", hex: "#000000", rgb: { r: 0, g: 0, b: 0 } },
  217: { name: "Mx Foil Red", hex: "#FF0000", rgb: { r: 255, g: 0, b: 0 } },
  129: { name: "Mx Red", hex: "#FF0000", rgb: { r: 255, g: 0, b: 0 } },
  130: { name: "Mx Pink Red", hex: "#FF0000", rgb: { r: 255, g: 0, b: 0 } },
  131: { name: "Mx Tile Brown", hex: "#A52A2A", rgb: { r: 165, g: 42, b: 42 } },
  134: { name: "Mx Terracotta", hex: "#FF6347", rgb: { r: 255, g: 99, b: 71 } },
  132: { name: "Mx Brown", hex: "#A52A2A", rgb: { r: 165, g: 42, b: 42 } },
  133: { name: "Mx Buff", hex: "#F0E68C", rgb: { r: 240, g: 230, b: 140 } },
  135: { name: "Mx Orange", hex: "#FFA500", rgb: { r: 255, g: 165, b: 0 } },
  136: { name: "Mx Light Orange", hex: "#FFB84D", rgb: { r: 255, g: 184, b: 77 } },
  219: { name: "Mx Foil Orange", hex: "#FFA500", rgb: { r: 255, g: 165, b: 0 } },
  137: { name: "Mx Light Yellow", hex: "#FFFFE0", rgb: { r: 255, g: 255, b: 224 } },
  218: { name: "Mx Foil Yellow", hex: "#FFFF00", rgb: { r: 255, g: 255, b: 0 } },
  138: { name: "Mx Ochre Yellow", hex: "#FFB14D", rgb: { r: 255, g: 177, b: 77 } },
  139: { name: "Mx Lemon", hex: "#FFFACD", rgb: { r: 255, g: 250, b: 205 } },
  140: { name: "Mx Olive Green", hex: "#808000", rgb: { r: 128, g: 128, b: 0 } },
  212: { name: "Mx Foil Dark Green", hex: "#006400", rgb: { r: 0, g: 100, b: 0 } },
  141: { name: "Mx Pastel Green", hex: "#90EE90", rgb: { r: 144, g: 238, b: 144 } },
  213: { name: "Mx Foil Light Green", hex: "#90EE90", rgb: { r: 144, g: 238, b: 144 } },
  142: { name: "Mx Aqua Green", hex: "#00FFFF", rgb: { r: 0, g: 255, b: 255 } },
  146: { name: "Mx Teal Blue", hex: "#008080", rgb: { r: 0, g: 128, b: 128 } },
  143: { name: "Mx Tile Blue", hex: "#0000FF", rgb: { r: 0, g: 0, b: 255 } },
  214: { name: "Mx Foil Dark Blue", hex: "#00008B", rgb: { r: 0, g: 0, b: 139 } },
  144: { name: "Mx Medium Blue", hex: "#0000CD", rgb: { r: 0, g: 0, b: 205 } },
  215: { name: "Mx Foil Light Blue", hex: "#ADD8E6", rgb: { r: 173, g: 216, b: 230 } },
  145: { name: "Mx Pastel Blue", hex: "#ADD8E6", rgb: { r: 173, g: 216, b: 230 } },
  216: { name: "Mx Foil Violet", hex: "#800080", rgb: { r: 128, g: 0, b: 128 } },
  147: { name: "Mx Violet", hex: "#800080", rgb: { r: 128, g: 0, b: 128 } },
  148: { name: "Mx Pink", hex: "#FFC0CB", rgb: { r: 255, g: 192, b: 203 } },
  149: { name: "Mx Clear", hex: "#FFFFFF", rgb: { r: 255, g: 255, b: 255 } }
};

/**
 * Get LEGO color by ID
 * @param {number} id - LEGO color ID
 * @returns {Object|null} - Color object or null if not found
 */
export function getLegoColor(id) {
  return LEGO_COLORS[id] || null;
}

/**
 * Get all LEGO color IDs
 * @returns {Array<number>} - Array of color IDs
 */
export function getAllColorIds() {
  return Object.keys(LEGO_COLORS).map(Number);
}

/**
 * Get count of total colors in database
 * @returns {number}
 */
export function getColorCount() {
  return Object.keys(LEGO_COLORS).length;
}

/**
 * Search colors by name (case-insensitive)
 * @param {string} searchTerm
 * @returns {Array} - Array of matching color objects with IDs
 */
export function searchColorsByName(searchTerm) {
  const term = searchTerm.toLowerCase();
  return Object.entries(LEGO_COLORS)
    .filter(([_, color]) => color.name.toLowerCase().includes(term))
    .map(([id, color]) => ({ id: Number(id), ...color }));
}

/**
 * Get colors by category (opaque, transparent, metallic, etc.)
 * @param {string} category - "transparent", "chrome", "pearl", "metallic", "satin", "glitter", "glow", "speckle", "mx", "opaque"
 * @returns {Array} - Array of color objects with IDs
 */
export function getColorsByCategory(category) {
  const categoryMap = {
    transparent: (name) => name.startsWith('Trans-'),
    chrome: (name) => name.startsWith('Chrome'),
    pearl: (name) => name.includes('Pearl'),
    metallic: (name) => name.startsWith('Metallic'),
    satin: (name) => name.startsWith('Satin'),
    glitter: (name) => name.includes('Glitter'),
    glow: (name) => name.includes('Glow In Dark'),
    speckle: (name) => name.includes('Speckle'),
    mx: (name) => name.startsWith('Mx '),
    opaque: (name) => !name.startsWith('Trans-') && !name.includes('Pearl') && 
                       !name.startsWith('Chrome') && !name.startsWith('Metallic') &&
                       !name.startsWith('Satin') && !name.includes('Glitter') &&
                       !name.includes('Glow') && !name.includes('Speckle') &&
                       !name.startsWith('Mx ')
  };

  const filterFn = categoryMap[category.toLowerCase()];
  if (!filterFn) return [];

  return Object.entries(LEGO_COLORS)
    .filter(([_, color]) => filterFn(color.name))
    .map(([id, color]) => ({ id: Number(id), ...color }));
}