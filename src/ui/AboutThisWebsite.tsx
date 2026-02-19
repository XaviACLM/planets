import { type FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

function iconLink(url: string, faIcon: typeof faTimes) {
	return (
	  <a
		href={url}
		target="_blank"
		rel="noopener noreferrer"
		className="inline-flex items-center gap-2 text-theme-text/50 hover:text-theme-text 
				   transition-colors translate-y-1"
	  >
		<FontAwesomeIcon icon={faIcon} />
	  </a>
	);
}

function textLink(url: string, text: string) {
	return (
	  <a
		href={url}
		target="_blank"
		rel="noopener noreferrer"
		className="text-gray-400 hover:text-gray-800 
		           transition-colors"
	  >
	    {text}
	  </a>
	);
}

const AboutThisWebsite: FC = () => (
	<div className="p-4 text-sm">
		<p>
			This website was built and is more-or-less maintained by
			Xavi Arnal (
			{iconLink("https://xaviaclm.github.io/", faGlobe)},
			{iconLink("https://github.com/XaviACLM", faGithub)},
			{iconLink("https://www.linkedin.com/in/xavi-arnal-524256218/", faLinkedin)}
			). The source code, along with a longer discussion on the object and design philososphy behind the website, is all available on
			{" "}{textLink("https://github.com/XaviACLM/planets","GitHub")}.
		</p>
	</div>
);

export default AboutThisWebsite;
