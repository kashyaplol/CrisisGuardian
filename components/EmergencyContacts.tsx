import React from 'react';
import { PhoneIcon, GlobeAltIcon, FireIcon as FireDeptIcon } from './icons/Icons';

const contacts = [
  { name: 'National Emergency Number', number: '112', icon: GlobeAltIcon },
  { name: 'Police', number: '100', icon: PhoneIcon },
  { name: 'Fire', number: '101', icon: FireDeptIcon },
  { name: 'Ambulance', number: '102 / 108', icon: PhoneIcon },
  { name: 'Disaster Management Services', number: '1078', icon: GlobeAltIcon },
  { name: 'Women Helpline', number: '1091', icon: PhoneIcon },
  { name: 'Child Helpline', number: '1098', icon: PhoneIcon },
  { name: 'NDRF Helpline', number: '011-26107953, 09711077372', icon: GlobeAltIcon }
];

const EmergencyContacts: React.FC = () => {
  return (
    <div>
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[--brand-charcoal] sm:text-5xl dark:text-white">Emergency Contacts</h1>
            <p className="mt-4 text-lg text-[--brand-slate] dark:text-slate-400">Keep these important numbers handy. In an emergency, dial immediately.</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact, index) => (
            <div key={index} className="bg-white dark:bg-[--dark-surface] p-6 rounded-3xl soft-shadow soft-shadow-hover">
                <div className="flex items-center">
                    <contact.icon className="h-8 w-8 text-[--brand-orange] mr-4"/>
                    <div>
                        <h3 className="font-semibold text-[--brand-charcoal] dark:text-white">{contact.name}</h3>
                        <p className="text-2xl font-bold text-[--brand-charcoal] dark:text-white tracking-wider">{contact.number}</p>
                    </div>
                </div>
            </div>
            ))}
        </div>
         <div className="mt-12 p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-center max-w-4xl mx-auto">
            <h4 className="font-bold text-orange-800 dark:text-orange-200">Local Contacts</h4>
            <p className="text-orange-700 dark:text-orange-300 mt-2">Always save the contact numbers for your local police station, fire station, and district disaster management office. These can provide the fastest response in your specific area.</p>
        </div>
    </div>
  );
};

export default EmergencyContacts;