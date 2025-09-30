import Link from "next/link";

const footerLink = ({text, linkText, href}: FooterLinkProps) => {
    return(
        <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
                {text}{` `}
                <Link href={href} className="footer-link">
                    {linkText}
                </Link>
            </p>
        </div>
    )
}

export default footerLink;