/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

declare global {
  namespace Express {
    interface Request {
      clientHostname?: string;
    }
  }
}

export {};
