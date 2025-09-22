
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
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">Emergency Contacts</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Keep these important numbers handy. In an emergency, dial immediately.</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center">
                    <contact.icon className="h-8 w-8 text-blue-600 mr-4"/>
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">{contact.name}</h3>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 tracking-wider">{contact.number}</p>
                    </div>
                </div>
            </div>
            ))}
        </div>
         <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center max-w-4xl mx-auto dark:bg-yellow-900/20 dark:border-yellow-500/30">
            <h4 className="font-bold text-yellow-800 dark:text-yellow-200">Local Contacts</h4>
            <p className="text-yellow-700 dark:text-yellow-300 mt-2">Always save the contact numbers for your local police station, fire station, and district disaster management office. These can provide the fastest response in your specific area.</p>
        </div>
    </div>
  );
};

export default EmergencyContacts;